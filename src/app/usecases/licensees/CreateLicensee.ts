const CREATE_LICENSEE_FIELDS = [
  'name',
  'email',
  'phone',
  'licenseKind',
  'useChatbot',
  'chatbotDefault',
  'chatbotUrl',
  'chatbotAuthorizationToken',
  'messageOnResetChatbot',
  'chatbotApiToken',
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

class CreateLicensee {
  licenseeRepository: any

  constructor({ licenseeRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
  }

  async execute(fields = {}) {
    const payload = { ...pickFields(fields, CREATE_LICENSEE_FIELDS), active: true }

    return await this.licenseeRepository.create(payload)
  }
}

export { CreateLicensee, CREATE_LICENSEE_FIELDS }
