/** @format */

const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Fast = require('../models/fastModel')
const User = require('../models/userModel')
const {format} = require('date-fns')

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

exports.postFastingDetails = asyncHandler(async (req, res) => {
	const {fastStartedAt, fastEndedAt, durationOfTheFast, fastType} = req.body

	const userId = req.user.id
	console.log('userId: ', userId)
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

	// Getting the Day of Fast based on Start date
	const fastDayInWeek = date => {
		return format(new Date(Number(date)), 'iii')
	}

	const fastDetails = {
		durationOfTheFast,
		fastStartedAt,
		fastEndedAt,
		fastType,
		fastDayInWeek,
	}

	user.fasts.push(fastDetails)
	user.totalNumberOfFasts += 1

	user.save()
	res.status(201).send('Created')
})

exports.getFastingDetails = asyncHandler(async (req, res) => {
	const userId = req.user.id
	console.log('userId: ', userId)
	const user = await User.findById(userId).select('-__v')

	if (!user) {
		res.status(400).json({
			message: 'User not found',
		})
		throw new Error('User not found')
	}
	const details = {
		totalNumberOfFasts: user.totalNumberOfFasts,
		averageFastDuration: user.averageFastDuration,
		totalFastDuration: user.totalFastDuration,
		fasts: user.fasts,
	}
	res.json(details)
})
