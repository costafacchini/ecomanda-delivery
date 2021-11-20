import parseUrl from './objectToQueryParameter'

describe('#objectToQueryParameter', () => {
  it('returns the encoded query parameter converted from an object', () => {
    const urlParams = {
      name: 'Morty',
      surname: 'Smith',
      fullName: 'Morty Smith',
      expression: 'Produto 1',
      ncm: '38151210',
    }
    expect(parseUrl('resource/test', urlParams)).toBe('resource/test?name=Morty&surname=Smith&fullName=Morty%20Smith&expression=Produto%201&ncm=38151210')
  })

  describe('when some data is a Date', () => {
    it('fills the value of the parameter as a string in iso8601 format', () => {
      expect(parseUrl('resource/test', { birthdate: new Date(2002, 6, 18) })).toBe('resource/test?birthdate=2002-07-18T00:00:00.000Z')
      expect(parseUrl('resource/test', { birthdate: new Date(2002, 6, 18).toISOString() })).toBe('resource/test?birthdate=2002-07-18T00:00:00.000Z')
    })
  })

  describe('when some data is an Array', () => {
    describe('if it is an array of primitive values', () => {
      it('fills the value of the parameter as a string', () => {
        const date = new Date()
        const urlParams = { array_status: [date, 'authorized,pending', 'canceled'] }
        expect(parseUrl('resource/test', urlParams)).toBe(`resource/test?array_status=${date.toISOString()},authorized%2Cpending,canceled`)
      })
    })

    describe('is it is an array of objects', () => {
      it('fills the value of the parameter as a form data', () => {
        const urlParams = {
          products: [
            { product_id: 1, quantity: '2.0' },
            { product_id: 2, quantity: '3.0' },
          ],
        }
        expect(parseUrl('resource/test', urlParams)).toBe(
          `resource/test?products[][product_id]=1&products[][quantity]=2.0&products[][product_id]=2&products[][quantity]=3.0`
        )
      })
    })
  })

  describe('when some data is a boolean', () => {
    it('fills the value of the parameter as a string', () => {
      const urlParams = { boy: true, girl: false }
      expect(parseUrl('resource/test', urlParams)).toBe('resource/test?boy=true&girl=false')
    })
  })

  describe('when some data is a integer', () => {
    it('fills the value of the parameter as a string', () => {
      const urlParams = { start: 0, end: 15 }
      expect(parseUrl('resource/test', urlParams)).toBe('resource/test?start=0&end=15')
    })
  })

  describe('when some data is an empty string', () => {
    it('fills the value of the parameter as empty', () => {
      const urlParams = { food: '' }
      expect(parseUrl('resource/test', urlParams)).toBe('resource/test?food=')
    })
  })

  describe('when some data is undefined or null', () => {
    it('ignores the parameter', () => {
      const urlParams = { height: null, brain: undefined }
      expect(parseUrl('resource/test', urlParams)).toBe('resource/test')
    })
  })
})
