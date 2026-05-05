class AdressesController {
  constructor({ contactRepository, normalizePhone, updateContactAddress } = {}) {
    this.contactRepository = contactRepository
    this.normalizePhone = normalizePhone
    this.updateContactAddress = updateContactAddress

    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
  }

  async update(req, res) {
    try {
      const result = await this.updateContactAddress.execute({
        number: req.params.number,
        licenseeId: req.licensee._id,
        fields: req.body,
      })

      if (!result) return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })

      res.status(200).send(result)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
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
