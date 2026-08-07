import { MongoServer } from './mongo'
import { connectPostgres } from './postgres'
import { logger } from '../app/helpers/logger'

async function connect() {
  const config = {
    development: { uri: process.env.MONGODB_URI },
    test: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
      host: process.env.MONGODB_HOST,
      db: process.env.MONGODB_DB,
    },
    production: { uri: process.env.MONGODB_URI },
  }

  const { username, password, host, db, uri } = (config as any)[process.env.NODE_ENV || 'development']

  const mongoServer = new MongoServer(uri || `mongodb://${username}:${password}@${host}/${db}`)
  await mongoServer.connect()

  // Non-fatal during migration window — app still starts without Postgres.
  // Made fatal in task-09 (flip reads).
  try {
    await connectPostgres()
  } catch (err: any) {
    logger.error(`PostgreSQL connection failed (non-fatal during migration): ${err.message}`)
  }
}

export { connect }
