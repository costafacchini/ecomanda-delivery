import Repository, { RepositoryMemory, sortRecords } from './repository'
const _ = require("lodash") as any
import Trigger from '../models/Trigger'
import { requireDependency } from '../helpers/RequireDependency'

class TriggerRepositoryDatabase extends Repository {
  model() {
    return Trigger
  }

  async findFirst(params: Record<string, any> = {}, relations: any[] = []) {
    const onlyIdFilter = Object.keys(params ?? {}).length === 1 && '_id' in (params ?? {})

    if (onlyIdFilter && relations.length === 0) {
      return await Trigger.findById(params._id)
    }

    return await super.findFirst(params, relations)
  }

  async create(fields: any = {}) {
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

async function createTrigger(fields: any, { triggerRepository }: { triggerRepository?: any } = {}) {
  return await requireDependency(triggerRepository, 'triggerRepository', 'createTrigger').create(fields)
}

async function getAllTriggerBy(filters: any, order: any = {}, { triggerRepository }: { triggerRepository?: any } = {}) {
  return await requireDependency(triggerRepository, 'triggerRepository', 'getAllTriggerBy').find(filters, order)
}

export { TriggerRepositoryDatabase, TriggerRepositoryMemory, createTrigger, getAllTriggerBy }
