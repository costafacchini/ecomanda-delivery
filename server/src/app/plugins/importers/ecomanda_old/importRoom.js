const Room = require('@models/Room')
const { sanitizeModelErrors } = require('@helpers/SanitizeErrors')

async function importRoom(room, contact) {
  if (room) {
    const roomImported = new Room({ roomId: room, contact: contact._id, token: `${contact.number}${contact.type}` })

    const validation = roomImported.validateSync()
    if (validation) {
      return {
        success: false,
        error: `Room não importada: motivo: ${JSON.stringify(sanitizeModelErrors(validation.errors))}`,
      }
    } else {
      await roomImported.save()

      return {
        success: true,
        room: roomImported,
      }
    }
  } else {
    return { success: false }
  }
}

module.exports = importRoom
