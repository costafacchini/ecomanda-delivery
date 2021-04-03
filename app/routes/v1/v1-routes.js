const express = require('express')

const router = express.Router()

router.post('/teste', (req, res) => {
  res.json({ message: 'Certo' })
})

module.exports = router
