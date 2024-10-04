const express = require('express')
const router = express.Router()
const Attachment = require('../models/Attachment')

router.get('/', async (req, res) => {
  try {
    const attachments = await Attachment.find()
    res.json(attachments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
