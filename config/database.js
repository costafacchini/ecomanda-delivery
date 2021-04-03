const { MongoServer } = require('../config/mongo')

async function connect() {
  const config = {
    development: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
      host: process.env.MONGODB_HOST,
      db: process.env.MONGODB_DB,
    },
    test: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
      host: process.env.MONGODB_HOST,
      db: process.env.MONGODB_DB,
    },
    production: { uri: process.env.MONGODB_URI },
  }

  const { username, password, host, db, uri } = config[process.env.NODE_ENV || 'development']

  const mongoServer = new MongoServer(uri || `mongodb://${username}:${password}@${host}/${db}`)
  await mongoServer.connect()
}

module.exports = connect
