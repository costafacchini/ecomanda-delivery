const Contact = require('@models/Contact')
const NormalizePhone = require('@helpers/NormalizePhone')
const _ = require('lodash')

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
      contact = await Contact.findOne({
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

    await Contact.updateOne({ _id: contact._id }, { $set: fields }, { runValidators: true })

    res.status(200).send(await Contact.findOne({ _id: contact._id }))
  }

  async show(req, res) {
    try {
      const normalizedPhone = new NormalizePhone(req.params.number)
      const licensee = req.licensee._id
      const contact = await Contact.findOne({
        number: normalizedPhone.number,
        licensee: licensee._id,
        type: normalizedPhone.type,
      }).populate('licensee')

      if (!contact) {
        return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })
      }

      res.status(200).send(contact)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = AdressesController
