import Repository, { RepositoryMemory, sortRecords, stringifyObjectIds } from './repository'
import _ from 'lodash'
import Trigger from '../models/Trigger'
import { requireDependency } from '../helpers/RequireDependency'
import { ITrigger } from '../../types'

class TriggerRepositoryDatabase extends Repository<ITrigger> {
  model() {
    return Trigger
  }

  async findFirst(params: Record<string, any> = {}, relations: any[] = []) {
    const onlyIdFilter = Object.keys(params ?? {}).length === 1 && '_id' in (params ?? {})

    if (onlyIdFilter && relations.length === 0) {
      const doc = await Trigger.findById(params._id).lean()
      return doc ? (stringifyObjectIds(doc) as ITrigger) : null
    }

    return await super.findFirst(params, relations)
  }

  async create(fields: any = {}): Promise<ITrigger> {
    const doc = await this.save(new Trigger({ ...(fields ?? {}) }))
    return stringifyObjectIds(doc.toObject()) as ITrigger
  }

  async find(params = {}, order = {}) {
    const query = Trigger.find(params ?? {}).lean()

    if (!_.isEmpty(order)) {
      query.sort(order)
    }

    const docs = await query
    return docs.map((doc: any) => stringifyObjectIds(doc)) as ITrigger[]
  }
}

class TriggerRepositoryMemory extends RepositoryMemory<ITrigger> {
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
