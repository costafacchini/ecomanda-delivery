const express = require('express')
const { queue } = require('../../../config/queue')

const router = express.Router()

router.post('/teste', (req, res) => {
  queue.add('job', { body: req.body }, { attempts: 3 })

  res.json({ message: 'Certo' })
})

module.exports = router
