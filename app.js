/** @format */

const express = require('express')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const userRouter = require('./routes/userRoutes')

const app = express()
app.use(cors())

// Limiting heavy traffic in short span from the same client end point
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP please try again after an hour!',
})
app.use('/api', limiter)
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser())

app.use('/api/v1/users', userRouter)

module.exports = app
