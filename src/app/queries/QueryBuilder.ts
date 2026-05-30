class QueryBuilder {
  query: any
  filterByClause: any[]
  filterDifferent: any[]
  filterByIntervalClause: any[]
  filterByExpressionClause: any
  filterByLessThanClause: any
  filterByGreaterThanClause: any
  sortByClause: any
  pageClause: any
  limitClause: any

  constructor(model) {
    this.query = model
    this.filterByClause = []
    this.filterDifferent = []
    this.filterByIntervalClause = []
    this.filterByExpressionClause
    this.filterByLessThanClause
  }

  sortBy(field, direction) {
    this.sortByClause = { [field]: direction }
  }

  page(page, limit) {
    this.pageClause = page
    this.limitClause = limit
  }

  filterBy(field, value) {
    this.filterByClause.push({ field, value })
  }

  filterNotEqual(field, value) {
    this.filterDifferent.push({ field, value })
  }

  filterByInterval(field, start, end) {
    this.filterByIntervalClause.push({ field, start, end })
  }

  filterByExpression(fields, value) {
    this.filterByExpressionClause = { fields, value }
  }

  filterByLessThan(field, end) {
    this.filterByLessThanClause = { field, end }
  }

  filterByGreaterThan(field, start) {
    this.filterByGreaterThanClause = { field, start }
  }

  getQuery() {
    this.query = this.query.find({})

    if (this.sortByClause) {
      this.query = this.query.sort(this.sortByClause)
    }

    if (this.pageClause && this.limitClause) {
      this.query.skip((this.pageClause - 1) * this.limitClause).limit(this.limitClause)
    }

    if (this.filterByClause.length > 0) {
      this.filterByClause.forEach((filter) => {
        this.query.where(filter.field).equals(filter.value)
      })
    }

    if (this.filterNotEqual.length > 0) {
      this.filterDifferent.forEach((filter) => {
        this.query.where(filter.field).ne(filter.value)
      })
    }

    if (this.filterByIntervalClause.length > 0) {
      this.filterByIntervalClause.forEach((filterInterval) => {
        this.query.where(filterInterval.field).gt(filterInterval.start).lt(filterInterval.end)
      })
    }

    if (this.filterByExpressionClause) {
      const fields = []
      if (this.filterByExpressionClause.fields instanceof Array) {
        this.filterByExpressionClause.fields.forEach((field) => fields.push(field))
      } else {
        fields.push(this.filterByExpressionClause.fields)
      }

      const values = this.filterByExpressionClause.value.split(' ')
      if (fields.length === 1 && values.length === 1) {
        this.query.where({ [fields[0]]: new RegExp(values[0], 'i') })
      } else {
        const expressionClauses = []
        fields.forEach((field) => {
          values.forEach((value) => {
            expressionClauses.push({ [field]: new RegExp(value, 'i') })
          })
        })
        this.query.or(expressionClauses)
      }
    }

    if (this.filterByLessThanClause) {
      this.query.where(this.filterByLessThanClause.field).lt(this.filterByLessThanClause.end)
    }

    if (this.filterByGreaterThanClause) {
      this.query.where(this.filterByGreaterThanClause.field).gt(this.filterByGreaterThanClause.start)
    }

    return this.query
  }
}

export { QueryBuilder }
