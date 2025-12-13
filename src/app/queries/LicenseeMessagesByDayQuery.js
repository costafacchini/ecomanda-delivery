import moment from 'moment-timezone'
import { LicenseeRepositoryDatabase } from '../repositories/licensee.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'

class LicenseeMessagesByDayQuery {
  constructor(startDate, endDate) {
    this.startDate = startDate
    this.endDate = endDate
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  validateDates() {
    if (!this.startDate || !this.endDate) {
      throw new Error('startDate and endDate must be provided')
    }

    if (this.startDate > this.endDate) {
      throw new Error('startDate must be less than or equal to endDate')
    }
  }

  buildRange() {
    const cursor = moment.tz(this.startDate, 'UTC').startOf('day')
    const end = moment.tz(this.endDate, 'UTC').endOf('day')
    const days = []

    while (cursor.isSameOrBefore(end, 'day')) {
      days.push(cursor.format('YYYY-MM-DD'))
      cursor.add(1, 'day')
    }

    return days
  }

  buildAggregation() {
    const match = {
      createdAt: {
        $gte: this.startDate,
        $lte: this.endDate,
      },
    }

    if (this.licenseeClause) {
      match.licensee = this.licenseeClause
    }

    return [
      {
        $match: match,
      },
      {
        $group: {
          _id: {
            licensee: '$licensee',
            day: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'UTC',
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.licensee': 1,
          '_id.day': 1,
        },
      },
      {
        $group: {
          _id: '$_id.licensee',
          days: {
            $push: {
              date: '$_id.day',
              count: '$count',
            },
          },
        },
      },
    ]
  }

  async all() {
    this.validateDates()

    const messageRepository = new MessageRepositoryDatabase()
    const licenseeRepository = new LicenseeRepositoryDatabase()

    const aggregation = this.buildAggregation()
    const rawCounts = await messageRepository.model().aggregate(aggregation)

    const mapDays = rawCounts.reduce((acc, current) => {
      acc[current._id.toString()] = current.days
      return acc
    }, {})

    const licenseeFilter = this.licenseeClause ? { _id: this.licenseeClause } : {}
    const licensees = await licenseeRepository.find(licenseeFilter)
    licensees.sort((left, right) => left.name.localeCompare(right.name))

    const range = this.buildRange()

    return licensees.map((licensee) => {
      const licenseeDays = mapDays[licensee._id.toString()] || []
      const normalized = licenseeDays.reduce((acc, current) => {
        acc[current.date] = current.count
        return acc
      }, {})

      return {
        _id: licensee._id,
        name: licensee.name,
        days: range.map((day) => ({
          date: day,
          count: normalized[day] || 0,
        })),
      }
    })
  }
}

export { LicenseeMessagesByDayQuery }
