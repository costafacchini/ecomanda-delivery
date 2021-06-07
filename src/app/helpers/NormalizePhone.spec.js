const NormalizePhone = require('./NormalizePhone')

describe('NormalizePhone', () => {
  it('does not normalize phone if number is blank', () => {
    const phone = new NormalizePhone('')

    expect(phone.number).toEqual('')
  })

  it('returns @c.us if number is blank', () => {
    const phone = new NormalizePhone('')

    expect(phone.type).toEqual('@c.us')
  })

  describe('phone number', () => {
    it('normalizes phone', () => {
      const phone = new NormalizePhone('5539012345683@c.us')

      expect(phone.number).toEqual('5539012345683')
    })

    it('does not normalize phone if length is 13 numbers', () => {
      const phone = new NormalizePhone('5512345678901@c.us')

      expect(phone.number).toEqual('5512345678901')
    })

    it('normalizes phone adding number 9 if length is 12 numbers', () => {
      const phone = new NormalizePhone('551234567890@c.us')

      expect(phone.number).toEqual('5512934567890')
    })

    it('normalizes phone adding Brazil code 55 and 9 if length is 10 numbers', () => {
      const phone = new NormalizePhone('1234567890@c.us')

      expect(phone.number).toEqual('5512934567890')
    })

    it('normalizes phone adding Brazil code 55 if length is 11 numbers', () => {
      const phone = new NormalizePhone('1234567890@c.us')

      expect(phone.number).toEqual('5512934567890')
    })

    it('normalizes phone if it has invalid chars', () => {
      const phone = new NormalizePhone('+551A383B7265C34@c.us')

      expect(phone.number).toEqual('5513983726534')
    })

    it('does not normalize phone if length less than 9 numbers', () => {
      const shortPhone = new NormalizePhone('123456789@c.us')

      expect(shortPhone.number).toEqual('')
    })

    it('does not normalize phone if length greather than 14 numbers', () => {
      const groupPhoneType1 = new NormalizePhone('87628172617..123213123123@g.us')

      expect(groupPhoneType1.number).toEqual('87628172617..123213123123')

      const groupPhoneType2 = new NormalizePhone('5511989187726-1622497000@g.us')

      expect(groupPhoneType2.number).toEqual('5511989187726-1622497000')
    })

    it('does not remove . char if it is no last char', () => {
      const phone = new NormalizePhone('+551383726534.@c.us')

      expect(phone.number).toEqual('551383726534.')
    })
  })

  describe('type', () => {
    it('returns contact type', () => {
      const phone = new NormalizePhone('5513837265340@c.us')

      expect(phone.type).toEqual('@c.us')
    })

    it('returns group type if is group message', () => {
      const phone = new NormalizePhone('551383726534..32424324@g.us')

      expect(phone.type).toEqual('@g.us')
    })

    it('returns group type if number contains more than 13 characters', () => {
      const phone = new NormalizePhone('55138372653465')

      expect(phone.type).toEqual('@g.us')
    })
  })
})