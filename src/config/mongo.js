const mongoose = require('mongoose')
const { createDefaultUser } = require('../setup/database')

const mongoConnectionOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

module.exports = { MongoServer }
