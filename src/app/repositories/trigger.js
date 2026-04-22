import Repository from './repository.js'
import _ from 'lodash'
import Trigger from '../models/Trigger.js'

class TriggerRepositoryDatabase extends Repository {
  model() {
    return Trigger
  }

  async create(fields = {}) {
    const trigger = new Trigger({ ...(fields ?? {}) })

    return await trigger.save()
  }

  async find(params = {}, order = {}) {
    const query = Trigger.find(params ?? {})

    if (!_.isEmpty(order)) {
      query.sort(order)
    }

    return await query
  }
}

const triggerRepository = new TriggerRepositoryDatabase()

async function createTrigger(fields) {
  return await triggerRepository.create(fields)
}

async function getAllTriggerBy(filters, order = {}) {
  return await triggerRepository.find(filters, order)
}

export { TriggerRepositoryDatabase, createTrigger, getAllTriggerBy }
