const Message = require('@models/Message')
const QueryBuilder = require('@queries/QueryBuilder')

describe('QueryBuilder', () => {
  describe('sortBy', () => {
    it('should return a query with sortBy', () => {
      const query = new QueryBuilder(Message)
      query.sortBy('name', -1)

      expect(query.getQuery().options).toEqual({
        sort: { name: -1 },
      })
    })
  })

  describe('page', () => {
    it('should return a query with page', () => {
      const query = new QueryBuilder(Message)
      query.page(3, 15)

      expect(query.getQuery().options).toEqual({ skip: 30, limit: 15 })
    })
  })

  describe('filterBy', () => {
    it('should return a query with filterBy', () => {
      const query = new QueryBuilder(Message)
      query.filterBy('name', 'John')
      query.filterBy('age', 18)

      expect(query.getQuery()._conditions).toEqual({ age: 18, name: 'John' })
    })
  })

  describe('filterByInterval', () => {
    it('should return a query with filterByInterval', () => {
      const query = new QueryBuilder(Message)
      query.filterByInterval('age', 18, 30)
      query.filterByInterval('createdAt', new Date('2019-01-01'), new Date('2019-01-31'))

      expect(query.getQuery()._conditions).toEqual({
        age: { $gt: 18, $lt: 30 },
        createdAt: { $gt: new Date('2019-01-01'), $lt: new Date('2019-01-31') },
      })
    })
  })
})
