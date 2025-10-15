const delay = (ms) => new Promise((res) => setTimeout(res, ms))

class DelayController {
  async time(req, res) {
    const time = parseInt(req.params.time) * 1000
    console.info(`Segurando o request por : ${time} milisegundos`)

    await delay(time)

    res.sendStatus(200)
  }
}

export { DelayController }
