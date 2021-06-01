/** @format */

const mongoose = require('mongoose')

const fastSchema = mongoose.Schema({
	durationOfTheFast: {
		type: Number,
		default: 0,
	},
	fastStartedAt: {
		type: Date,
	},
	fastEndedAt: {
		type: Date,
	},
	fastType: {
		type: String,
		enum: {values: ['16:8', '18:9', '20:4']},
		default: '16:8',
	},
})

const userFastStatsSchema = mongoose.Schema({
	totalFastDuration: {
		type: Number,
		default: 0,
	},
	totalNumberOfFasts: {
		type: Number,
		default: 0,
	},
	fasts: [fastSchema],
})

const Fast = mongoose.model('Fast', userFastStatsSchema)

module.exports = Fast
