class QueryBuilder {
  constructor(model) {
    this.query = model
    this.filterByClause = []
    this.filterByIntervalClause = []
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

  filterByInterval(field, start, end) {
    this.filterByIntervalClause.push({ field, start, end })
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

    if (this.filterByIntervalClause.length > 0) {
      this.filterByIntervalClause.forEach((filterInterval) => {
        this.query.where(filterInterval.field).gt(filterInterval.start).lt(filterInterval.end)
      })
    }

    return this.query
  }
}

module.exports = QueryBuilder
