const Room = require('@models/Room')

async function createRoom(fields) {
  const room = new Room({
    ...fields,
  })

  return await room.save()
}

async function getRoomBy(filter) {
  return await Room.findOne(filter).populate('contact')
}

module.exports = { createRoom, getRoomBy }
