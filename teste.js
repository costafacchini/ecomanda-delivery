require('dotenv').config()
require('module-alias/register')
require('@models/index')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const connect = require('./src/config/database')
connect()

async function start() {
  const licensee = await Licensee.findById('60ac572a94cc1d00046bea61')

  const contact = await Contact.findOne({
    number: '5511989187726',
    type: '@c.us',
    licensee: licensee._id,
  })

  console.log(contact)
}

start()