const express = require('express')
const router = express.Router()
const groupConversationController = require('../controllers/GroupConversationController')

router.get('/', groupConversationController.allGroupConversations)
router.post('/create', groupConversationController.createGroupConversation)

module.exports = router
