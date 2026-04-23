import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { config as loadDotenv } from 'dotenv'
import { buildSmokeEnv, projectRoot, resolveSmokeEnvFile } from './env.mjs'

const DEFAULT_TIMEOUT_MS = 30000
const POLL_INTERVAL_MS = 1000

function buildUrls(smokeEnv) {
  return {
    appBaseUrl: `http://127.0.0.1:${smokeEnv.appPort}`,
    frontendBaseUrl: `http://127.0.0.1:${smokeEnv.clientPort}`,
    chatwootStateUrl: 'http://127.0.0.1:3101/_smoke/state',
    ycloudStateUrl: 'http://127.0.0.1:3102/_smoke/state',
    mocksResetUrl: 'http://127.0.0.1:3101/_smoke/reset',
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  const data = contentType.includes('application/json') && text ? JSON.parse(text) : text

  return { response, data }
}

async function assertOk(url, options, message) {
  const { response, data } = await requestJson(url, options)
  if (!response.ok) {
    throw new Error(`${message}. status=${response.status} body=${JSON.stringify(data)}`)
  }
  return data
}

async function readPayload(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath)
  const contents = await fs.readFile(absolutePath, 'utf8')
  return JSON.parse(contents)
}

async function pollUntil(description, callback, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const result = await callback()
    if (result) {
      return result
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error(`Timed out while waiting for ${description}`)
}

async function checkFrontend(frontendBaseUrl) {
  const response = await fetch(frontendBaseUrl)
  const html = await response.text()

  if (!response.ok) {
    throw new Error(`Frontend check failed with status ${response.status}`)
  }

  if (!html.toLowerCase().includes('<!doctype html')) {
    throw new Error('Frontend check failed because Vite did not return HTML')
  }
}

async function loginAdmin(appBaseUrl) {
  const credentials = {
    email: process.env.DEFAULT_USER || 'smoke-admin@example.com',
    password: process.env.DEFAULT_PASSWORD || '12345678',
  }

  const tokenPayload = await assertOk(
    `${appBaseUrl}/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    },
    'Login check failed',
  )

  if (!tokenPayload.token) {
    throw new Error('Login check failed because the token is missing')
  }

  return {
    ...credentials,
    token: tokenPayload.token,
  }
}

async function checkResourcesUser(appBaseUrl, loginResult) {
  const user = await assertOk(
    `${appBaseUrl}/resources/users/${encodeURIComponent(loginResult.email)}`,
    {
      headers: {
        'x-access-token': loginResult.token,
      },
    },
    'Resources user check failed',
  )

  if (user.email !== loginResult.email) {
    throw new Error(`Resources user check failed because the email differs: ${user.email}`)
  }

  return user
}

async function resetMockState(url) {
  await assertOk(
    url,
    {
      method: 'POST',
    },
    'Mock state reset failed',
  )
}

async function checkMessengerToChat(appBaseUrl, apiToken, urls) {
  const payload = await readPayload('src/scripts/smoke/payloads/messenger-inbound-text.json')

  await assertOk(
    `${appBaseUrl}/api/v1/messenger/message?token=${encodeURIComponent(apiToken)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Messenger webhook check failed',
  )

  return await pollUntil('chatwoot outbound capture', async () => {
    const state = await assertOk(urls.chatwootStateUrl, {}, 'Chatwoot state fetch failed')
    return state.chatwoot?.messages?.length > 0 ? state : null
  })
}

async function checkChatToMessenger(appBaseUrl, apiToken, urls) {
  const payload = await readPayload('src/scripts/smoke/payloads/chat-outbound-message.json')

  await assertOk(
    `${appBaseUrl}/api/v1/chat/message?token=${encodeURIComponent(apiToken)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Chat webhook check failed',
  )

  return await pollUntil('ycloud outbound capture', async () => {
    const state = await assertOk(urls.ycloudStateUrl, {}, 'YCloud state fetch failed')
    return state.ycloud?.messages?.length > 0 ? state : null
  })
}

async function main() {
  const envFile = resolveSmokeEnvFile()
  loadDotenv({ path: envFile, override: true })

  const smokeEnv = buildSmokeEnv(process.env)
  const urls = buildUrls(smokeEnv)

  await checkFrontend(urls.frontendBaseUrl)
  const loginResult = await loginAdmin(urls.appBaseUrl)
  const user = await checkResourcesUser(urls.appBaseUrl, loginResult)
  await resetMockState(urls.mocksResetUrl)

  const messengerToChatState = await checkMessengerToChat(urls.appBaseUrl, smokeEnv.licenseeApiToken, urls)
  const chatToMessengerState = await checkChatToMessenger(urls.appBaseUrl, smokeEnv.licenseeApiToken, urls)

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        action: 'check',
        envFile,
        frontendUrl: urls.frontendBaseUrl,
        appUrl: urls.appBaseUrl,
        adminEmail: loginResult.email,
        userId: user._id,
        captures: {
          chatwootMessages: messengerToChatState.chatwoot.messages.length,
          ycloudMessages: chatToMessengerState.ycloud.messages.length,
        },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
