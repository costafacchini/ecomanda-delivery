const mongoose = require('mongoose')
const { setup } = require('../setup/database')

async function connect() {
  const config = {
    development: {
      username: 'root',
      password: 'pwk372ew',
      host: 'localhost',
      db: 'ecomanda-delivery'
    },
    test: {
      username: 'root',
      password: 'pwk372ew',
      host: 'localhost',
      db: 'ecomanda-delivery'
    },
    production: {
      uri: process.env.MONGODB_URI
    }
  }

  const { username, password, host, db, uri } = config[process.env.NODE_ENV || 'development']

  try {
    mongoose.connection
      .on('error', console.error.bind(console, 'connection error:'))
      .once('open', () => {
        console.log('conectou')
        // setup()
      })

    await mongoose.connect(uri || `mongodb://${username}:${password}@${host}/${db}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports = connect
