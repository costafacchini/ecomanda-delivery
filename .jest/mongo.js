const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongoConnectionOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}

class MongoServerTest {
  constructor() {
    this.mongoServer = new MongoMemoryServer({ binary: { version: '4.0.14' } })
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

module.exports = { MongoServerTest }
