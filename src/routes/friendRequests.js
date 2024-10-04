const express = require('express')
const router = express.Router()
const friendRequestController = require('../controllers/friendRequestController')

router.get('/', friendRequestController.getAll)
router.post('/send', friendRequestController.sendRequest)
router.get('/pending/:user', friendRequestController.pending)
router.get('/sent/:user', friendRequestController.sent)
router.post('/accept', friendRequestController.accept)

module.exports = router
