const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { createDefaultUser } = require('../setup/database')

const mongoConnectionOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}

class MongoServerTest {
  constructor() {
    this.mongoServer = new MongoMemoryServer()
  }

  async connect() {
    const mongoUri = await this.mongoServer.getUri()
    await mongoose.connect(mongoUri, mongoConnectionOpts, (err) => {
      if (err) {
        throw new Error(err)
      }
    })
  }

  async disconnect() {
    await mongoose.disconnect()
    await this.mongoServer.stop()
  }
}

class MongoServer {
  constructor(uri) {
    this.mongoUri = uri
  }

  async connect() {
    try {
      mongoose.connection
        .on('error', (err) => {
          throw new Error(err)
        })
        .once('open', () => {
          createDefaultUser()
        })

      await mongoose.connect(this.mongoUri, mongoConnectionOpts)
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = { MongoServerTest, MongoServer }
