import Repository, { RepositoryMemory, sortRecords } from './repository'
import _ from 'lodash'
import Trigger from '../models/Trigger'
import { requireDependency } from '../helpers/RequireDependency'

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
  async find(params = {}, orderOrRelations = {}) {
    if (Array.isArray(orderOrRelations)) {
      return await super.find(params, orderOrRelations)
    }

    const records = await super.find(params)

    if (_.isEmpty(orderOrRelations)) {
      return records
    }

    return sortRecords(records, orderOrRelations)
  }
}

async function createTrigger(fields, { triggerRepository } = {}) {
  return await requireDependency(triggerRepository, 'triggerRepository', 'createTrigger').create(fields)
}

async function getAllTriggerBy(filters, order = {}, { triggerRepository } = {}) {
  return await requireDependency(triggerRepository, 'triggerRepository', 'getAllTriggerBy').find(filters, order)
}

export { TriggerRepositoryDatabase, TriggerRepositoryMemory, createTrigger, getAllTriggerBy }
