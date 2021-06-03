/** @format */

const mongoose = require('mongoose')
const millisecondsToMinutes = require('date-fns/millisecondsToMinutes')

// Fast= {
// 					durationOfTheFast: {
// 						type: Number,
// 						default: 0,
// 					},
// 					fastStartedAt: {
// 						type: Date,
// 					},
// 					fastEndedAt: {
// 						type: Date,
// 					},
// 					fastType: {
// 						type: String,
// 						enum: {values: ['16:8', '18:9', '20:4']},
// 						default: '16:8',
// 					},
// 					fastDayInWeek: {
// 						type: String,
// 					},
// 				},

const userSchema = mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			required: false,
			default: false,
			select: false,
		},
		fasts: {
			type: Array,
			default: [],
		},
		totalFastDuration: {
			type: Number,
			default: 0,
		},
		totalNumberOfFasts: {
			type: Number,
			default: 0,
		},
		averageFastDuration: {
			type: Number,
			default: 0,
		},
		longestFast: {
			type: Number,
			default: 0,
		},
		startedAtDateArr: {
			type: Array,
			default: [],
		},
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
		timestamps: true,
	},
)

userSchema.virtual('name').get(function () {
	return this.email.split('@')[0]
})

const User = mongoose.model('User', userSchema)

module.exports = User
