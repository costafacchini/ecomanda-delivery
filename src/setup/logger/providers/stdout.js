import { randomUUID } from 'crypto'

function formatMeta(meta) {
  if (!meta) return ''
  if (typeof meta === 'string') return meta
  try {
    return JSON.stringify(meta)
  } catch {
    return '[unserializable-meta]'
  }
}

function createStdoutProvider() {
  const logWithLevel = (level, message, meta) => {
    const parts = []
    if (message) parts.push(message)
    const metaString = formatMeta(meta)
    if (metaString) parts.push(metaString)
    // eslint-disable-next-line no-console
    if (level === 'error') console.error(parts.join(' '))
    // eslint-disable-next-line no-console
    else if (level === 'info') console.info(parts.join(' '))
    // eslint-disable-next-line no-console
    else console.log(parts.join(' '))
  }

  const log = ({ level, message, meta }) => logWithLevel(level, message, meta)

  const httpLogger = (req, res, next) => {
    const existing = req.headers['x-request-id']
    const id = existing || randomUUID()
    if (!existing) res.setHeader('x-request-id', id)
    req.id = id
    next()
  }

  return {
    log,
    httpLogger,
  }
}

export { createStdoutProvider }
