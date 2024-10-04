const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.allUsers)
router.post('/find', userController.findUser)
router.post('/findContacts', userController.findContacts)
router.post('/findGroups', userController.findGroups)
router.put('/edit', userController.editUser)

module.exports = router
