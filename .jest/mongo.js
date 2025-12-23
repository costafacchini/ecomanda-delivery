import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

class MongoServerTest {
  async connect() {
    if (!global.__MONGOINSTANCE) {
      const instance = await MongoMemoryServer.create()
      global.__MONGOINSTANCE = instance
    }

    const mongoUri = global.__MONGOINSTANCE.getUri()
    await mongoose.connect(mongoUri, {})
    await mongoose.connection.db.dropDatabase()
  }

  async disconnect() {
    const { connection } = mongoose

    if (connection.readyState !== 0 && connection.readyState !== 3) {
      try {
        await connection.close(true)
        // eslint-disable-next-line no-empty
      } catch (error) {
        if (error.name !== 'MongoClientClosedError') throw error
      }
    }
    try {
      const instance = global.__MONGOINSTANCE
      if (instance) {
        await instance.stop()
        global.__MONGOINSTANCE = null
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
}

export { MongoServerTest }
