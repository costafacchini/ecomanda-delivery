import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { config as loadDotenv } from 'dotenv'
import {
  buildSmokeEnv,
  projectRoot,
  resolveSmokeEnvFile,
  smokeComposeFiles,
  smokeFrontendLogFile,
  smokeFrontendPidFile,
} from './env.mjs'

function composeArgs(envFile, commandArgs) {
  return ['compose', '--env-file', envFile, ...smokeComposeFiles.flatMap((file) => ['-f', file]), ...commandArgs]
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      ...options,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function ensureClientDependencies() {
  const viteBinaryPath = path.join(projectRoot, 'client', 'node_modules', '.bin', 'vite')
  if (fs.existsSync(viteBinaryPath)) {
    return
  }

  await runCommand('yarn', ['--cwd', 'client', 'install'])
}

async function ensureFrontendStarted(smokeEnv) {
  await ensureClientDependencies()
  fs.mkdirSync(path.dirname(smokeFrontendPidFile), { recursive: true })

  if (fs.existsSync(smokeFrontendPidFile)) {
    const existingPid = Number.parseInt(fs.readFileSync(smokeFrontendPidFile, 'utf8').trim(), 10)
    if (Number.isInteger(existingPid) && isProcessRunning(existingPid)) {
      return existingPid
    }
    fs.rmSync(smokeFrontendPidFile, { force: true })
  }

  const logStream = fs.openSync(smokeFrontendLogFile, 'w')
  const frontendProcess = spawn(
    'yarn',
    ['--cwd', 'client', 'run', 'start', '--host', '127.0.0.1', '--port', `${smokeEnv.clientPort}`],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        API_PROXY_TARGET: smokeEnv.apiProxyTarget,
      },
      detached: true,
      stdio: ['ignore', logStream, logStream],
    },
  )

  frontendProcess.unref()
  fs.writeFileSync(smokeFrontendPidFile, `${frontendProcess.pid}\n`)

  return frontendProcess.pid
}

async function seedSmokeData(envFile) {
  const maxAttempts = 20

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await runCommand('docker', composeArgs(envFile, ['exec', '-T', 'app', 'node', 'src/scripts/smoke/seed.mjs']))
      return
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      await sleep(2000)
    }
  }
}

async function main() {
  const envFile = resolveSmokeEnvFile()
  loadDotenv({ path: envFile, override: true })

  const smokeEnv = buildSmokeEnv(process.env)

  await runCommand(
    'docker',
    composeArgs(envFile, ['up', '-d', '--build', 'mongo', 'redis', 'rabbitmq', 'smoke-mocks', 'app', 'worker']),
  )
  await seedSmokeData(envFile)

  const frontendPid = await ensureFrontendStarted(smokeEnv)

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        action: 'start',
        envFile,
        appUrl: `http://127.0.0.1:${smokeEnv.appPort}`,
        frontendUrl: `http://127.0.0.1:${smokeEnv.clientPort}`,
        frontendPid,
        frontendLog: smokeFrontendLogFile,
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
