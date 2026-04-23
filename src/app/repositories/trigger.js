import Repository, { RepositoryMemory, sortRecords } from './repository.js'
import _ from 'lodash'
import Trigger from '../models/Trigger.js'

class TriggerRepositoryDatabase extends Repository {
  model() {
    return Trigger
  }

  async findFirst(params = {}, relations = []) {
    const onlyIdFilter = Object.keys(params ?? {}).length === 1 && '_id' in (params ?? {})

    if (onlyIdFilter && relations.length === 0) {
      return await Trigger.findById(params._id)
    }

    return await super.findFirst(params, relations)
  }

  async create(fields = {}) {
    const trigger = new Trigger({ ...(fields ?? {}) })

    return await this.save(trigger)
  }

  async find(params = {}, order = {}) {
    const query = Trigger.find(params ?? {})

    if (!_.isEmpty(order)) {
      query.sort(order)
    }

    return await query
  }
}

class TriggerRepositoryMemory extends RepositoryMemory {
  async find(params = {}, order = {}) {
    const records = await super.find(params)

    if (_.isEmpty(order)) {
      return records
    }

    return sortRecords(records, order)
  }
}

async function createTrigger(fields) {
  const triggerRepository = new TriggerRepositoryDatabase()
  return await triggerRepository.create(fields)
}

async function getAllTriggerBy(filters, order = {}) {
  const triggerRepository = new TriggerRepositoryDatabase()
  return await triggerRepository.find(filters, order)
}

export { TriggerRepositoryDatabase, TriggerRepositoryMemory, createTrigger, getAllTriggerBy }
