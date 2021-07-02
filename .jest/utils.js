const { MongoServerTest } = require('./mongo')

jest.setTimeout(600000)

const mongoServer = new MongoServerTest()

module.exports = mongoServer
