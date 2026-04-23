import 'dotenv/config'
import fs from 'node:fs'
import { config as loadDotenv } from 'dotenv'
import { projectRoot, resolveSmokeEnvFile, smokeComposeFiles, smokeFrontendPidFile } from './env.mjs'
import { spawn } from 'node:child_process'

function composeArgs(envFile, commandArgs) {
  return ['compose', '--env-file', envFile, ...smokeComposeFiles.flatMap((file) => ['-f', file]), ...commandArgs]
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
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

function stopFrontend() {
  if (!fs.existsSync(smokeFrontendPidFile)) {
    return false
  }

  const pid = Number.parseInt(fs.readFileSync(smokeFrontendPidFile, 'utf8').trim(), 10)
  fs.rmSync(smokeFrontendPidFile, { force: true })

  if (!Number.isInteger(pid)) {
    return false
  }

  try {
    process.kill(-pid, 'SIGTERM')
  } catch {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      return false
    }
  }

  return true
}

async function main() {
  const envFile = resolveSmokeEnvFile()
  loadDotenv({ path: envFile, override: true })

  const frontendStopped = stopFrontend()
  await runCommand('docker', composeArgs(envFile, ['down', '--remove-orphans']))

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        action: 'stop',
        envFile,
        frontendStopped,
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
