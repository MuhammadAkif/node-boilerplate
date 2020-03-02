const dotenv =require("dotenv")
/* To load .env variables */
dotenv.config()
const APIError = require("../core/APIError")
const bodyParser = require("body-parser")
const compression = require("compression")
const cors = require("cors")
const config = require("config")
const database = require("./Database")
const express = require("express")
const fs = require("fs")
const helmet = require("helmet")
const HttpStatus= require("http-status-codes")
const morgan = require("morgan")
const path = require("path")
const RateLimit = require("express-rate-limit")
const Response = require("./Response")
const utils = require("./Utils")


class APIServer {
	constructor() {
		this.app = express()
		this.database = database
	}

	_handleErrors() {
		utils.logger.info("setting up the error handler")

		this.app.use((err, req, res, next) => {

			res
				.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR)
				.send({ _error: err.message || "Internal Server Error", type: err.type })

			next()
		})
	}

	_setupUtils() {
		utils.logger.info("setting up utils")

		const limiter = new RateLimit({
			windowMs: config.application.rateLimit.timeWindow * 60 * 1000,
			max: config.application.rateLimit.maxRequests,
			delayMs: 0
		})


		this.app.use(bodyParser.json({limit: "2mb"}))
		this.app.use(bodyParser.urlencoded({ extended: true }))
		this.app.use(limiter)
		this.app.use(cors({exposedHeaders: ["Authorization","Access-Control-Allow-Headers", "Authorization" ,"Origin, X-Requested-With, Content-Type, Accept"]}))
		this.app.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*")
			res.header("Access-Control-Allow-Methods", "GET, OPTIONS")
			res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
			res.header("Access-Control-Allow-Credentials", true)
			return next()
		})
		this.app.use(helmet())
		this.app.use(compression({filter: (req,res) => {
				if (req.headers["x-no-compression"]) {
					// don't compress responses with this request header
					return false
				}
				// fallback to standard filter function
				return compression.filter(req, res)
			}}))
		if (process.env.NODE_ENV !== "test") {
			this.app.use(morgan("combined", { stream: utils.logger.stream }))
		}
	}

	_setupRoutes () {
		this.router = express.Router()
		const apiServer = this
		this.services = require("../services/index")
		const routesDir = path.join(__dirname, "../api/v1", "controllers")

		fs
			.readdirSync(routesDir)
			.forEach((file) => {
				if (file.match(/(.+Controller)\.js$/) && !file.match(/BaseController.js/)) {

					let serviceName = file.split("Controller")[0]
					let service = this.services[serviceName + "Service"]

					let route = require(path.join(routesDir, file))(service, APIError, Response)

					if (route.path) {

						apiServer.router.use(route.path, route.router)

						if (route.alias) {
							apiServer.router.use(route.alias, route.router)
						}
					}
				}
			})
		this.app.use(config.application.path, this.router)

		/*To check if server is running*/
		this.app.use("/health", (req, res) => {
			res.status(200).json({
				passed: 1
			})
		})

		/* To handle wrong request*/
		this.app.use((req, res) => {
			res.sendStatus(HttpStatus.NOT_FOUND)
		})


		utils.logger.info("routes registered")

		return Promise.resolve()
	}

	_startListening () {
		return new Promise((resolve, reject) => {
			let server = this.app.listen(process.env.PORT || 8081,
				config.application.address,
				config.application.backlog)
				.on("listening", () => {
					utils.logger.info(`the server is listening on port ${process.env.PORT}`)
					resolve(server)
				})
				.on("error", (err) => {
					reject(err)
				})
		})
	}

	async _stopListening () {
		return new Promise((resolve) => {
			if (!this.server) {
				resolve()
			}

			this.server.close(resolve)
			utils.logger.info("the application is offline")
		})
	}

	async _dbConnect () {
		try {
			await this.database.connect()
		} catch (err) {
			utils.logger.error(`database connection error', ${err}`)
		}
	}

	async start () {
		utils.logger.info("the application is starting")

		this._setupUtils()

		await this._dbConnect()
		await this._setupRoutes()

		this._handleErrors()

		this.server = await this._startListening()

		return this.server
	}

	async stop () {
		utils.logger.info("killing the server")


		const closeDbConnection = await this.database.closeConnection()
		const stopListening = await this._stopListening()


		return closeDbConnection && stopListening
	}
}

module.exports = APIServer

