/** @format */

const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')
dotenv.config({
	path: './config.env',
})
process.on('uncaughtException', err => {
	console.log('uncaughtException! shutting down the server...')
	console.error(err)
	console.log(err.name, err.message)
	process.exit(1)
})

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => console.log('DB connection successful!'))

const app = require('./app')

const port = process.env.PORT || 8000
const server = app.listen(port, () => console.log(`Listening on port ${port}!`))
