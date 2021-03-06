/** @format */

const express = require('express')
const authController = require('../controllers/authController')
const fastController = require('../controllers/fastController')

const router = express.Router()

router.post('/', authController.registerUser)
router.post('/login', authController.loginUser)
router
	.route('/fast-stats')
	.get(authController.protect, fastController.getFastingDetails)
	.post(authController.protect, fastController.postFastingDetails)
	.put(authController.protect, fastController.updateFast)
// router.put('/fast-stats/:id', authController.protect)
module.exports = router
