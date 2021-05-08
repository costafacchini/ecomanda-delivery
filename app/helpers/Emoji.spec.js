const emoji = require('./Emoji')
const { emojiList } = require('./EmojiList')

describe('Emoji', () => {
  describe('#replace', () => {
    it('replaces the emoji text', () => {
      expect(emoji.replace(':grinning:')).toEqual('😀')
    })

    it.each(emojiList)('replaces the rocketchat emoji for whatsapp emoji %o', emojiItem => {
      expect(emoji.replace(emojiItem.rocket)).toEqual(emojiItem.wpp)
    })

    it('replaces the emoji inside some text', () => {
      expect(emoji.replace('some text with :grinning: inside')).toEqual('some text with 😀 inside')
    })

    it('replaces the emoji inside some text', () => {
      expect(emoji.replace('some text with :grinning: inside')).toEqual('some text with 😀 inside')
    })
  })
})
