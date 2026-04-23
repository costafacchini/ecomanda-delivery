import mongoose from 'mongoose'
import { createDefaultUser } from '../setup/database.js'

const mongoConnectionOpts = {}

class MongoServer {
  constructor(uri) {
    this.mongoUri = uri
  }

  async connect() {
    try {
      await mongoose.connect(this.mongoUri, mongoConnectionOpts)
      await createDefaultUser()
    } catch (err) {
      throw new Error(err.message, { cause: err })
    }
  }
}

export { MongoServer }
