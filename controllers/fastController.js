/** @format */

const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Fast = require('../models/fastModel')
const User = require('../models/userModel')
const {format, formatDistanceStrict} = require('date-fns')
const {parseISO} = require('date-fns')
const {summary} = require('date-streaks')

// this:  {
//   durationOfTheFast: 100,
//   fastType: '16:8',
//   totalFastDuration: 0,
//   totalNumberOfFasts: 3000,
//   _id: 60b5d3d0c884ad1d5c6c441b,
//   email: 'test1@gmail.com',
//   password: '123456',
//   createdAt: "2021-06-01T06:29:36.108Z",
//   updatedAt: 2021-06-01T07:00:28.786Z,
//   __v: 0,
//   name: 'test1',
//   id: '60b5d3d0c884ad1d5c6c441b'
// }

// Getting the Day of Fast based on Start date
const getFastDayInWeek = date => {
	return format(parseISO(date), 'iii')
}

exports.postFastingDetails = asyncHandler(async (req, res) => {
	const {fastStartedAt, fastEndedAt, durationOfTheFast, fastType} = req.body
	console.table({fastStartedAt, fastEndedAt})
	const userId = req.user.id

	const user = await User.findById(userId).select('-__v')

	if (!user) {
		res.status(400).json({
			message: 'User not found',
		})
		throw new Error('User not found')
	}

	user.totalFastDuration += durationOfTheFast
	user.averageFastDuration = (
		user.totalFastDuration / user.totalNumberOfFasts
	).toFixed(2)
	// Streak
	user.startedAtDateArr.push(new Date(fastStartedAt))

	// Longest Fast -Start
	const currentDuration = user.longestFast
	if (currentDuration < Number(durationOfTheFast)) {
		user.longestFast = durationOfTheFast
	}
	// Longest Fast -End
	const fastDayInWeek = getFastDayInWeek(fastStartedAt)
	const fastDetails = {
		durationOfTheFast,
		fastStartedAt,
		fastEndedAt,
		fastType,
		fastDayInWeek,
		id: fastStartedAt,
	}

	user.fasts.push(fastDetails)
	user.totalNumberOfFasts += 1

	user.save()
	res.status(201).send('Created')
})

exports.getFastingDetails = asyncHandler(async (req, res) => {
	const userId = req.user.id

	const user = await User.findById(userId).select('-__v')

	if (!user) {
		res.status(400).json({
			message: 'User not found',
		})
		throw new Error('User not found')
	}
	const {currentStreak, longestStreak} = summary(user.startedAtDateArr)
	const stats = {
		totalNumberOfFasts: user.totalNumberOfFasts,
		averageFastDuration: user.averageFastDuration,
		totalFastDuration: user.totalFastDuration,
		longestFastDuration: user.longestFast,
		fasts: user.fasts,
		currentStreak,
		longestStreak,
	}
	res.json(stats)
})

exports.updateFast = asyncHandler(async (req, res) => {
	const {fastType, id, fastStartedAt, fastEndedAt} = req.body
	const user = await User.findById(req.user.id)
	if (!user) {
		res.status(400).json({
			message: 'User not found',
		})
		throw new Error('User not found')
	}
	const lastIndex = user.fasts.length - 1
	const fastNeededToUpdate = user.fasts[lastIndex]
	// fastNeededToUpdate:  {
	//   durationOfTheFast: 3,
	//   fastStartedAt: '2021-06-02T05:17:05.246Z',
	//   fastEndedAt: '2021-06-02T05:17:08.259Z',
	//   fastType: '16:8',
	//   fastDayInWeek: 'Wed',
	//   id: '2021-06-02T05:17:05.246Z'
	// }
	// const temp = User.find({fasts})
	let fastUpdated = {}

	if (fastStartedAt) {
		fastUpdated = {
			...fastNeededToUpdate,
			...fastUpdated,
			fastStartedAt,
		}

		console.log('user.startedAtDateArr: ', user.startedAtDateArr)
		user.startedAtDateArr.length = user.startedAtDateArr.length - 1
		user.startedAtDateArr.push(fastStartedAt)
		console.log('user.startedAtDateArr: ', user.startedAtDateArr)
	}
	if (fastEndedAt) {
		fastUpdated = {
			...fastNeededToUpdate,
			...fastUpdated,
			fastEndedAt,
		}
	}
	if (fastType) {
		fastUpdated = {
			...fastNeededToUpdate,
			...fastUpdated,
			fastType,
		}
	}
	const durationOfTheFast = formatDistanceStrict(
		parseISO(fastUpdated.fastEndedAt),
		parseISO(fastUpdated.fastStartedAt),
		{
			unit: 'second',
		},
	).split(' ')[0]
	fastUpdated = {
		...fastUpdated,
		durationOfTheFast,
		fastDayInWeek: getFastDayInWeek(fastUpdated.fastStartedAt),
	}
	user.fasts[lastIndex] = {...fastUpdated}
	user.totalFastDuration = user.fasts.reduce((acc, fast) => {
		return acc + Number(fast.durationOfTheFast)
	}, 0)
	user.averageFastDuration = (
		user.totalFastDuration / user.totalNumberOfFasts
	).toFixed(2)
	const currentDuration = user.longestFast
	console.table({currentDuration, durationOfTheFast})
	if (currentDuration < Number(fastUpdated.durationOfTheFast)) {
		user.longestFast = durationOfTheFast
	}

	user.markModified('fasts')
	user.markModified('averageFastDuration')
	user.markModified('totalFastDuration')
	user.markModified('startedAtDateArr')
	await user.save()
	console.log(fastUpdated)
})
