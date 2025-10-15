import { replace } from './Emoji.js'
import { emojiList } from './EmojiList'

describe('Emoji', () => {
  describe('#replace', () => {
    it('replaces the emoji text', () => {
      expect(replace(':grinning:')).toEqual('😀')
    })

    it.each(emojiList)('replaces the rocketchat emoji for whatsapp emoji %o', (emojiItem) => {
      expect(replace(emojiItem.rocket)).toEqual(emojiItem.wpp)
    })

    it('replaces the emoji inside some text', () => {
      expect(replace('some text with :grinning: inside')).toEqual('some text with 😀 inside')
    })
  })
})
