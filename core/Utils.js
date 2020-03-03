const jwt = require("jsonwebtoken")
const logger = require("./Logger").logger()
const util = require("util")

module.exports = {
	logger: {
		info: (...args) => {
			logger.info(util.format(...args))
		},
		error: (...args) => {
			logger.error(util.format(...args))
		}
	},
	date: {
		getCurrentDate: () => new Date().toISOString()
	},
	JWT: {
		verifyToken: async function (token) {
			return new Promise((resolve, reject) => {
				jwt.verify(token, process.env.HASH_SALT, async function (err, decoded) {
					if (err)
						reject(err)
					resolve(decoded)
				})
			})
		},
		createToken: async function (data) {
			return new Promise((resolve, reject) => {
				jwt.sign({
					exp: Math.floor(Date.now() / 1000) + (60 * 60),
					data: data
				}, process.env.HASH_SALT,function(err, token) {
					if(err)
						reject(err)

					resolve(token)
				})
			})
		}
	},
	Roles: {
		globalManager: {

		},
		manager: {
			"collection": [
				"read",
				"create",
				"update",
				"delete"
			],
			"user": [
				"read",
				"create",
				"update",
				"delete"
			],
			"item": [
				"read",
				"create",
				"update",
				"delete"
			]
		},
		regular: {
			"collection": [
				"read"
			],
			"user": [
				"read",
				"update"
			],
			"item": [
				"read"
			],
			"group": [
				"read"
			]
		}
	}
}
