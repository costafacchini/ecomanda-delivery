import { IRepository } from '@repositories/repository'

export interface IQueryableRepository<T> extends IRepository<T> {
  model(): any
}

interface FilterClause {
  field: string
  value: unknown
}

interface IntervalClause {
  field: string
  start: unknown
  end: unknown
}

interface ExpressionClause {
  fields: string | string[]
  value: string
}

class QueryBuilder {
  query: any
  filterByClause: FilterClause[]
  filterDifferent: FilterClause[]
  filterByIntervalClause: IntervalClause[]
  filterByExpressionClause?: ExpressionClause
  filterByLessThanClause?: { field: string; end: unknown }
  filterByGreaterThanClause?: { field: string; start: unknown }
  sortByClause?: Record<string, number>
  pageClause?: number
  limitClause?: number

  constructor(model: any) {
    this.query = model
    this.filterByClause = []
    this.filterDifferent = []
    this.filterByIntervalClause = []
  }

  sortBy(field: string, direction: number) {
    this.sortByClause = { [field]: direction }
  }

  page(page: number, limit: number) {
    this.pageClause = page
    this.limitClause = limit
  }

  filterBy(field: string, value: unknown) {
    this.filterByClause.push({ field, value })
  }

  filterNotEqual(field: string, value: unknown) {
    this.filterDifferent.push({ field, value })
  }

  filterByInterval(field: string, start: unknown, end: unknown) {
    this.filterByIntervalClause.push({ field, start, end })
  }

  filterByExpression(fields: string | string[], value: string) {
    this.filterByExpressionClause = { fields, value }
  }

  filterByLessThan(field: string, end: unknown) {
    this.filterByLessThanClause = { field, end }
  }

  filterByGreaterThan(field: string, start: unknown) {
    this.filterByGreaterThanClause = { field, start }
  }

  getQuery(): any {
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
      const fields: string[] = []
      if (this.filterByExpressionClause.fields instanceof Array) {
        this.filterByExpressionClause.fields.forEach((field: string) => fields.push(field))
      } else {
        fields.push(this.filterByExpressionClause.fields)
      }

      const values = this.filterByExpressionClause.value.split(' ')
      if (fields.length === 1 && values.length === 1) {
        this.query.where({ [fields[0]]: new RegExp(values[0], 'i') })
      } else {
        const expressionClauses: Record<string, RegExp>[] = []
        fields.forEach((field: string) => {
          values.forEach((value: string) => {
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
