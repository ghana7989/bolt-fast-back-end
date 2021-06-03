/** @format */

const express = require('express')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const userRouter = require('./routes/userRoutes')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const app = express()
app.use(cors())

// Limiting heavy traffic in short span from the same client end point
const limiter = rateLimit({
	max: 100000000000000000000000,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP please try again after an hour!',
})
// Data Sanitization against noSQL query injection or poisoning
app.use(mongoSanitize())

// Data Sanitization against XSS (cross site scripting attack)
app.use(xss())

// Prevent Parameter Pollution
app.use(
	hpp({
		whitelist: [
			'fasts',
			'fastDuration',
			'fastAverageDuration',
			'maxFastDuration',
			'fastType',
		],
	}),
)
app.use('/api', limiter)
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))

app.use('/api/v1/users', userRouter)

// If no above routes respond
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this Server 😥`, 404))
})

module.exports = app
