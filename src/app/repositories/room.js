import Room from '@models/Room.js'

async function createRoom(fields) {
  const room = new Room({
    ...fields,
  })

  return await room.save()
}

async function getRoomBy(filter) {
  return await Room.findOne(filter).populate('contact')
}

export default { createRoom, getRoomBy }
