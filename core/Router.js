const _ =  require("lodash")
const APIError = require("./APIError")
const BPromise = require("bluebird")
const express  = require("express")
const HTTPStatusCodes = require("http-status-codes")
const Response = require("./Response")

class Router {
	constructor(params) {
		this.path =  params.path || ""
		this.controller = params.controller || {}
		this.alias = params.alias || null
		this.routes = params.routes || {}

	}

	useControllerAction (path, controller, action) {
		let controllerAction = controller[action]

		return (req, res, next) => BPromise
			.resolve(controllerAction(req, res))
			.then((result) => {
				if (!result) {
					res.sendStatus(HTTPStatusCodes.NO_CONTENT)
				} else {
					let response = null

					if(result instanceof Response){
						response = result.createRespose()
					}else{
						throw new APIError({
							message: "Response object should be an instance of Response"
						})
					}

					if(response.headers) {
						res.set({
							...result.headers
						})
					}

					let responseHasObjectData = _.isObject(result) && Object.keys(_.omit(result, "status")).length > 0

					if (responseHasObjectData) {
						res.status(response.status).json(response.clientResponse)
					} else {
						res.sendStatus(response.status)
					}
				}
			})
			.catch(next)
	}

	registerRoutes() {
		const router = express.Router()

		for (let verb in this.routes) {
			for (let route in this.routes[verb]) {
				let action = this.routes[verb][route]

				if (typeof action === "object") {
					router[verb.toLowerCase()](
						route,
						_.slice(action, 0, action.length - 1),
						this.useControllerAction(this.path.substr(1),
							this.controller, action[action.length - 1])
					)
				} else {
					router[verb.toLowerCase()](
						route,
						this.useControllerAction(this.path.substr(1),
							this.controller, action)
					)
				}
			}
		}

		return {
			path: this.path,
			alias: this.alias || null,
			router: router
		}
	}

}

module.exports = Router
