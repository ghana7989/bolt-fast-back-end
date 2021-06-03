/** @format */
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const generateToken = id => {
	return jwt.sign(
		{
			id,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES_IN,
		},
	)
}

exports.protect = asyncHandler(async (req, res, next) => {
	let token =
		req.headers.authorization && req.headers.authorization.startsWith('Bearer')
			? req.headers.authorization.split(' ')[1]
			: undefined
	if (!token) return next(new Error('No Authorized Token'))
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const {id} = decoded
		console.log('id: ', id)
		req.user = await User.findById(id).select('-password')
		next()
	} catch (error) {
		res.status(401)
		next(new Error('User not found'))
	}
})

// app.use('/api/v1/users', userRouter)
// User Object looks like
// user:  {
//   _id: 60b5bcc0dd901f1c7c600e4b,
//   email: 'test@gmail.com',
//   password: '123456',
//   createdAt: 2021-06-01T04:51:12.755Z,
//   updatedAt: 2021-06-01T04:51:12.755Z,
//   __v: 0,
//   id: '60b5bcc0dd901f1c7c600e4b'
// }

// @desc        Register a new user
// @route       POST /api/v1/users
// @access      Public Route

exports.registerUser = asyncHandler(async (req, res) => {
	const {email, password} = req.body
	const userExists = await User.findOne({email})
	if (userExists) {
		res.status(400).json({
			message: 'User with this email already exists',
		})
		throw new Error('User with this email already exists')
	}

	const user = await User.create({
		email,
		password,
	})
	if (user) {
		const {id, email, name} = user

		res.status(201).json({
			id,
			email,
			name,
			token: generateToken(id),
		})
	} else {
		res.status(400).json({
			message: 'Invalid User Data',
		})
		throw new Error('Invalid User Data')
	}
})

// @desc        Authorize an user and get a token
// @route       POST /api/v1/users/login
// @access      Public Route

exports.loginUser = asyncHandler(async (req, res) => {
	const {email, password} = req.body
	const user = await User.findOne({email})
	// should actually save encrypted passwords even before the document
	// But using bcryptjs and hashing and salting take some resources I didn't implement
	if (user && (await user.correctPassword(password, user.password))) {
		const {id, email, name} = user
		res.json({
			id,
			email,
			name,
			token: generateToken(id),
		})
	} else {
		res.status(401).json({
			message: 'Invalid name or password',
		})
		throw new Error('Invalid name or password')
	}
})
