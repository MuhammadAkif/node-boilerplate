const httpStatus = require("http-status-codes")
const models = require("../core/Database").models
const authenticate = async (req, res, next) => {
	let token = req.headers["authorization"] || req.query.token
	if(!token)
		return res.status(httpStatus.UNAUTHORIZED).json({message: "Auth token is missing"})
	if (token.startsWith("bearer ") || token.startsWith("Bearer"))
		token = token.slice(7, token.length)
	try {
		const decodedUser = await models.User.verifyUserToken(token)
		const user = await models.User.verifyUserByEmail(decodedUser.email, decodedUser.userId)
		if(!user)
			return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Auth token"})
		if(!user.isActive || !user.isEmailVerified)
			return res.status(httpStatus.UNAUTHORIZED).json({message: "User is not active or Email not verified"})
		// eslint-disable-next-line require-atomic-updates
		req.userId = user.userId
		// eslint-disable-next-line require-atomic-updates
		req.user = user
		// eslint-disable-next-line require-atomic-updates
		req.userEmail = user.email
		next()
	} catch (err) {
		return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Auth token"})
	}
}

module.exports = { authenticate }
