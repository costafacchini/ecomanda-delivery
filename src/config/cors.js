import cors from 'cors'
import { redisConnection } from './redis.js'

function enableCors(app) {
  app.use((req, _res, next) => {
    const origin = req.headers['origin']
    if (origin) {
      redisConnection.sadd('cors:observed-origins', origin).catch(() => {})
    }
    next()
  })

  app.use(cors())
}

export { enableCors }
