const UPDATE_LICENSEE_FIELDS = [
  'name',
  'email',
  'phone',
  'active',
  'licenseKind',
  'useChatbot',
  'chatbotDefault',
  'chatbotUrl',
  'chatbotAuthorizationToken',
  'chatbotApiToken',
  'messageOnResetChatbot',
  'whatsappDefault',
  'whatsappToken',
  'whatsappUrl',
  'chatDefault',
  'chatUrl',
  'chatIdentifier',
  'chatKey',
  'unidadeId',
  'statusId',
  'messageOnCloseChat',
  'document',
  'kind',
  'financial_player_fee',
  'holder_name',
  'bank',
  'branch_number',
  'branch_check_digit',
  'account_number',
  'account_check_digit',
  'holder_kind',
  'holder_document',
  'account_type',
  'useSenderName',
  'useFileIDYcloud',
]

function pickFields(fields: Record<string, any> = {}, keys: any[] = []) {
  return keys.reduce((payload: Record<string, any>, key: any) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateLicensee {
  licenseeRepository: any

  constructor({ licenseeRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
  }

  async execute(id: any, fields = {}) {
    const payload = pickFields(fields, UPDATE_LICENSEE_FIELDS)

    await this.licenseeRepository.update(id, payload)

    return await this.licenseeRepository.findFirst({ _id: id })
  }
}

export { UpdateLicensee, UPDATE_LICENSEE_FIELDS }
