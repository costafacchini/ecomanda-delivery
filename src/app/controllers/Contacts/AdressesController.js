import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import _ from 'lodash'

function permit(fields) {
  const permitedFields = [
    'address',
    'address_number',
    'address_complement',
    'neighborhood',
    'city',
    'cep',
    'uf',
    'delivery_tax',
  ]

  return _.pick(fields, permitedFields)
}

class AdressesController {
  constructor({ contactRepository = new ContactRepositoryDatabase(), normalizePhone } = {}) {
    this.contactRepository = contactRepository
    this.normalizePhone = normalizePhone ?? ((number) => new NormalizePhone(number))

    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee
    let contact

    try {
      const normalizedPhone = this.normalizePhone(req.params.number)
      const licensee = req.licensee._id

      contact = await this.contactRepository.findFirst({
        number: normalizedPhone.number,
        licensee,
        type: normalizedPhone.type,
      })
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }

    if (!contact) {
      return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })
    }

    await this.contactRepository.update(contact._id, { ...fields })

    res.status(200).send(await this.contactRepository.findFirst({ _id: contact._id }))
  }

  async show(req, res) {
    try {
      const normalizedPhone = this.normalizePhone(req.params.number)
      const licensee = req.licensee._id

      const contact = await this.contactRepository.findFirst(
        {
          number: normalizedPhone.number,
          licensee,
          type: normalizedPhone.type,
        },
        ['licensee'],
      )

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })
      }

      res.status(200).send(contact)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export { AdressesController }
