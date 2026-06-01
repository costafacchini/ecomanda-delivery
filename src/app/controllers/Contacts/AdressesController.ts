class AdressesController {
  contactRepository: any
  normalizePhone: any
  updateContactAddress: any

  constructor({ contactRepository, normalizePhone, updateContactAddress }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
    this.normalizePhone = normalizePhone
    this.updateContactAddress = updateContactAddress

    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
  }

  async update(req: any, res: any) {
    try {
      const result = await this.updateContactAddress.execute({
        number: req.params.number,
        licenseeId: req.licensee._id,
        fields: req.body,
      })

      if (!result) return res.status(404).send({ errors: { message: `Contato ${req.params.number} não encontrado` } })

      res.status(200).send(result)
    } catch (error: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${error.message}` } })
    }
  }

  async show(req: any, res: any) {
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
    } catch (error: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${error.message}` } })
    }
  }
}

export { AdressesController }
