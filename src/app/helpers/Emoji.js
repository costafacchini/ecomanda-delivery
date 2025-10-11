import { emojiList } from './EmojiList'

function replace(message) {
  const regex = /(:[^:]*:)/gm
  const rocketEmojis = []

  let match
  while ((match = regex.exec(message)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    match.forEach((match) => {
      if (rocketEmojis.indexOf(match) === -1) rocketEmojis.push(match)
    })
  }

  return rocketEmojis.reduce((accMessage, rocketEmoji) => {
    const emoji = emojiList.find((emoji) => emoji.rocket === rocketEmoji)

    return accMessage.replace(rocketEmoji, emoji ? emoji.wpp : rocketEmoji)
  }, message)
}

module.exports.replace = replace
