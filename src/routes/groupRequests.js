const express = require('express')
const router = express.Router()
const groupRequestController = require('../controllers/groupRequestController')

router.get('/', groupRequestController.getAll)
router.post('/send', groupRequestController.send)
router.get('/pending/:user', groupRequestController.pending)
router.get('/sent/:user', groupRequestController.sent)
// router.post('/accept', groupRequestController.accept)

module.exports = router
