const express = require('express')
const router = express.Router()
const conversationController = require('../controllers/conversationController')

router.get('/', conversationController.allConversations)
router.post('/create', conversationController.createConversation)

module.exports = router
