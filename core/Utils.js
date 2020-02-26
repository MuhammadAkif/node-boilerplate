
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
		verifyJWTToken: async function (token) {
			return new Promise((resolve, reject) => {
				jwt.verify(token, process.env.HASH_SALT, async function (err, decoded) {
					if (err)
						reject(err.message)
					resolve(decoded)
				})
			})
		}
	},
	Database: {
		session: async function (db) {
			let mongoose = db.mongoose ? db.mongoose : this.mongoose
			if (!mongoose)
				throw new Error("db not found")
			
			let session = await mongoose.startSession()
			
			return {
				orgininalSession: session,
				startTransaction: () => {
					session.startTransaction()
				},
				commitTransaction: async () => {
					await session.commitTransaction()
					session.endSession()
				},
				abortTransaction: async () => {
					await session.abortTransaction()
					session.endSession()
				}
			}
			
		}
	}
}
