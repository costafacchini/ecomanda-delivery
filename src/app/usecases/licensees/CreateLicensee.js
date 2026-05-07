const CREATE_LICENSEE_FIELDS = [
  'name',
  'email',
  'phone',
  'active',
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
  'cartDefault',
  'unidadeId',
  'statusId',
  'messageOnCloseChat',
  'useCartGallabox',
  'productFractional2Name',
  'productFractional2Id',
  'productFractional3Name',
  'productFractional3Id',
  'productFractionalSize3Name',
  'productFractionalSize3Id',
  'productFractionalSize4Name',
  'productFractionalSize4Id',
  'productFractionals',
  'pedidos10_active',
  'pedidos10_integration',
  'pedidos10_integrator',
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

const DEFAULT_PEDIDOS10_INTEGRATION = '{}'

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateLicensee {
  constructor({ licenseeRepository } = {}) {
    this.licenseeRepository = licenseeRepository
  }

  async execute(fields = {}) {
    const payload = pickFields(fields, CREATE_LICENSEE_FIELDS)
    payload.pedidos10_integration = JSON.parse(payload.pedidos10_integration || DEFAULT_PEDIDOS10_INTEGRATION)

    return await this.licenseeRepository.create(payload)
  }
}

export { CreateLicensee, CREATE_LICENSEE_FIELDS, DEFAULT_PEDIDOS10_INTEGRATION }
