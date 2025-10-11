import NormalizePhone from '@helpers/NormalizePhone'
import { ContactRepositoryDatabase } from '@repositories/contact'
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
  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee
    let contact

    try {
      const normalizedPhone = new NormalizePhone(req.params.number)
      const licensee = req.licensee._id

      const contactRepository = new ContactRepositoryDatabase()
      contact = await contactRepository.findFirst({
        number: normalizedPhone.number,
        licensee: licensee._id,
        type: normalizedPhone.type,
      })
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }

    if (!contact) {
      return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })
    }

    const contactRepository = new ContactRepositoryDatabase()
    await contactRepository.update(contact._id, { ...fields })

    res.status(200).send(await contactRepository.findFirst({ _id: contact._id }))
  }

  async show(req, res) {
    try {
      const normalizedPhone = new NormalizePhone(req.params.number)
      const licensee = req.licensee._id

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.findFirst(
        {
          number: normalizedPhone.number,
          licensee: licensee._id,
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

export default AdressesController
