const HttpStatus = require("http-status-codes")

class Response {
	constructor({
		status = HttpStatus.OK,
		meta = undefined,
		headers=null,
		data=null
	}) {
		this.status = status
		this.headers = headers
		this.clientResponse = {
			meta,
			data
		}

	}

	createRespose() {
		let obj = {}
		for(let key in this){
			if(this[key] !== undefined && this[key] !== null) {
				obj[key] = this[key]
			}
		}
		return obj
	}
}

module.exports = Response

