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

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateTrigger {
  triggerRepository: any

  constructor({ triggerRepository }: Record<string, any> = {}) {
    this.triggerRepository = triggerRepository
  }

  async execute(id, fields = {}) {
    await this.triggerRepository.update(id, pickFields(fields, UPDATE_TRIGGER_FIELDS))

    return await this.triggerRepository.findFirst({ _id: id })
  }
}

export { UpdateTrigger, UPDATE_TRIGGER_FIELDS }
