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
  'awsId',
  'awsSecret',
  'bucketName',
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

class UpdateLicensee {
  constructor({ licenseeRepository } = {}) {
    this.licenseeRepository = licenseeRepository
  }

  async execute(id, fields = {}) {
    const payload = pickFields(fields, UPDATE_LICENSEE_FIELDS)
    payload.pedidos10_integration = JSON.parse(payload.pedidos10_integration || DEFAULT_PEDIDOS10_INTEGRATION)

    await this.licenseeRepository.update(id, payload)

    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    return {
      ...licensee,
      pedidos10_integration: JSON.stringify(licensee.pedidos10_integration),
    }
  }
}

export { UpdateLicensee, DEFAULT_PEDIDOS10_INTEGRATION, UPDATE_LICENSEE_FIELDS }
