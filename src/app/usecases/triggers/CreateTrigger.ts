const CREATE_TRIGGER_FIELDS = [
  'name',
  'triggerKind',
  'expression',
  'catalogMulti',
  'catalogSingle',
  'textReplyButton',
  'messagesList',
  'licensee',
  'order',
  'text',
  'catalogId',
]

import { IRepository } from '@repositories/repository'
import { ITrigger } from '../../../types'

interface CreateTriggerDeps {
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

class CreateTrigger {
  triggerRepository: IRepository<ITrigger>

  constructor({ triggerRepository }: CreateTriggerDeps) {
    this.triggerRepository = triggerRepository
  }

  async execute(fields: Record<string, any> = {}): Promise<ITrigger> {
    return await this.triggerRepository.create(pickFields(fields, CREATE_TRIGGER_FIELDS))
  }
}

export { CreateTrigger, CREATE_TRIGGER_FIELDS }
