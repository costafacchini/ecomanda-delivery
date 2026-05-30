const ADDRESS_FIELDS = [
  'address',
  'address_number',
  'address_complement',
  'neighborhood',
  'city',
  'cep',
  'uf',
  'delivery_tax',
]

function pickAddressFields(fields = {}) {
  return ADDRESS_FIELDS.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }
    return payload
  }, {})
}

class UpdateContactAddress {
  contactRepository: any
  normalizePhone: any

  constructor({ contactRepository, normalizePhone }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
    this.normalizePhone = normalizePhone
  }

  async execute({ number, licenseeId, fields }: Record<string, any> = {}) {
    const normalizedPhone = this.normalizePhone(number)

    const contact = await this.contactRepository.findFirst({
      number: normalizedPhone.number,
      licensee: licenseeId,
      type: normalizedPhone.type,
    })

    if (!contact) return null

    const permitted = pickAddressFields(fields)
    await this.contactRepository.update(contact._id, permitted)

    return await this.contactRepository.findFirst({ _id: contact._id })
  }
}

export { UpdateContactAddress }
