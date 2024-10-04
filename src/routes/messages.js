const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')

router.get('/', messageController.allMessages)
router.post('/create', messageController.createMessage)
router.get('/:conversation', messageController.findMessages)
router.post('/findByUsers', messageController.findByUsers)
router.post('/groupMessages', messageController.groupMessages)

module.exports = router
