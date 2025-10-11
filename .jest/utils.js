import MongoServerTest from './mongo'

jest.setTimeout(600000)

// Singleton instance - created once and reused across all tests
const mongoServer = new MongoServerTest()

export default mongoServer
