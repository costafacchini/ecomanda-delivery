import mongoose from 'mongoose'
import { createDefaultUser } from '../setup/database'

const mongoConnectionOpts = {}

class MongoServer {
  private mongoUri: string

  constructor(uri: string) {
    this.mongoUri = uri
  }

  async connect() {
    try {
      await mongoose.connect(this.mongoUri, mongoConnectionOpts)
      await createDefaultUser()
    } catch (err: any) {
      throw new Error(err.message, { cause: err })
    }
  }
}

export { MongoServer }
