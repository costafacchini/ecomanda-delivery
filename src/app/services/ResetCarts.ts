import moment from 'moment-timezone'

async function resetCarts({ cartRepository }: Record<string, any> = {}) {
  const timeLimit = moment().tz('UTC').subtract(1, 'hour')
  await cartRepository.updateMany({ concluded: false, createdAt: { $lte: timeLimit } }, { concluded: true })
  return
}

export { resetCarts }
