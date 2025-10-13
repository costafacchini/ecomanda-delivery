import mongoose from 'mongoose'
import { createDefaultUser } from '../setup/database.js'

const mongoConnectionOpts = {}

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

export { MongoServer }
