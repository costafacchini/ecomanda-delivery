const UPDATE_TRIGGER_FIELDS = [
  'name',
  'triggerKind',
  'expression',
  'catalogMulti',
  'catalogSingle',
  'textReplyButton',
  'messagesList',
  'order',
  'text',
  'catalogId',
]

import { IRepository } from '@repositories/repository'
import { ITrigger } from '../../../types'

interface UpdateTriggerDeps {
  triggerRepository: IRepository<ITrigger>
}

function pickFields(fields: Record<string, any> = {}, keys: string[] = []) {
  return keys.reduce((payload: Record<string, any>, key: string) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateTrigger {
  triggerRepository: IRepository<ITrigger>

  constructor({ triggerRepository }: UpdateTriggerDeps) {
    this.triggerRepository = triggerRepository
  }

  async execute(id: string, fields: Record<string, any> = {}): Promise<ITrigger | null> {
    await this.triggerRepository.update(id, pickFields(fields, UPDATE_TRIGGER_FIELDS))

    return await this.triggerRepository.findFirst({ _id: id })
  }
}

export { UpdateTrigger, UPDATE_TRIGGER_FIELDS }
