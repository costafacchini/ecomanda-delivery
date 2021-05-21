const { MongoServerTest } = require('./mongo')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000

const mongoServer = new MongoServerTest()

module.exports = mongoServer
