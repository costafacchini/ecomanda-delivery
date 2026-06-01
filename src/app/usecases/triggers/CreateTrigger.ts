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

function pickFields(fields: Record<string, any> = {}, keys: any[] = []) {
  return keys.reduce((payload: Record<string, any>, key: any) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateTrigger {
  triggerRepository: any

  constructor({ triggerRepository }: Record<string, any> = {}) {
    this.triggerRepository = triggerRepository
  }

  async execute(fields = {}) {
    return await this.triggerRepository.create(pickFields(fields, CREATE_TRIGGER_FIELDS))
  }
}

export { CreateTrigger, CREATE_TRIGGER_FIELDS }
