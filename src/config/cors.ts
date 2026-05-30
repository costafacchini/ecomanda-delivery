import cors from 'cors'
import { redisConnection } from './redis'

function enableCors(app: any) {
  app.use((req: any, _res: any, next: any) => {
    const origin = req.headers['origin']
    if (origin) {
      redisConnection.sadd('cors:observed-origins', origin).catch(() => {})
    }
    next()
  })

  app.use(cors())
}

export { enableCors }
