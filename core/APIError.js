const HttpStatus = require("http-status-codes")
const utils = require("./Utils")


class APIError extends Error {
	constructor (data) {
		super(data.message)
		this.type = "RegularError"
		this.message = data.message
		this.status = data.status || HttpStatus.INTERNAL_SERVER_ERROR
	}

	//TODO: fix normalize error array
	static normalize (error) {

		let normalizedErrors = []

		utils.logger.error(error)

		if (error.name === "ValidationError") {
			let errors = []
			for (let field in error.errors) {
				errors.push({[field]: error.errors[field].message})
			}
			normalizedErrors.push({
				type: "ValidationError",
				message: errors,
				status: HttpStatus.BAD_REQUEST
			})
		}
		else if(error.message && error.status || error.status !== 500) {
			normalizedErrors.push({
				type: "RegularError",
				message: [error.message],
				status: error.status
			})
		}
		else {
			normalizedErrors.push({
				type: "RegularError",
				message: ["Internal Server Error"],
				status: HttpStatus.INTERNAL_SERVER_ERROR
			})
		}
		return Promise.reject(normalizedErrors[0])
	}
}

module.exports = APIError
