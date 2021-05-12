const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/Auth.Controller')

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh-token', AuthController.refreshToken)
router.get('/profile', AuthController.profile)
router.delete('/logout', AuthController.logout)

module.exports = router