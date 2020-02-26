const _  = require("lodash")
const BPromise = require("bluebird")
const config = require("config")
//const RDSconfig = config.database.RDS[process.env.NODE_ENV || "development"]
const fs = require("fs")
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")
const path = require("path")
const utils = require("./Utils")

class Database {
	constructor () {
		this.models = {}
		this.mongoose = mongoose
		this.mongoose.Promise = BPromise
		this.mongoose.set("debug", true)
		this._loadPlugins()
		this._initEventListener()
	}

	_loadPlugins () {
		this.mongoose.plugin(mongoosePaginate)
	}
	_initEventListener () {
		this.mongoose.connection.on("error", (err) => {
			utils.logger.error(`connection error ${err}`)
		})

		this.mongoose.connection.on("connecting", () => {
			utils.logger.info("connecting to the database")
		})

		this.mongoose.connection.once("open", () => {
			utils.logger.info("database connection successful")
			this._loadModels()
		})

		this.mongoose.connection.on("close", () => {
			utils.logger.info("database connection was closed")
		})
	}

	_addOptionsInSchema (schema, options = {}) {
		_.forOwn(options, (value, key) => {
			schema.set(key, value)
		})
	}

	_addNewFieldsInSchema (schema, fields) {
		schema.add(fields)
	}

	_createModel (name, schema) {
		this._addNewFieldsInSchema(schema, {
			createdBy: {
				type: String
			},
			updatedBy: {
				type: String
			}
		})

		this._addOptionsInSchema(schema, {
			toJSON: {
				getters: true,
				virtuals: true
			},
			toObject: {
				getters: true,
				virtuals: true
			},
			timestamps: true
		})
		return this.mongoose.model(name, schema, name)
	}

	_loadModels () {
		utils.logger.info("loading mongoose models")

		const modelsDir = path.join(__dirname, "..", "models")
		fs
			.readdirSync(modelsDir)
			.forEach((file) => {
				if (file.match(/(.+Model)\.js$/)) {
					let schema = require(path.join(modelsDir, file))
					let modelName = file.split("Model.js")[0]

					this.models[modelName] = this._createModel(modelName, schema)
				}
			})

		utils.logger.info("all mongoose models are loaded")
	}

	async connect () {
		return BPromise
			.resolve(this.mongoose.connect(process.env.MONGODB_CONNECTION_STRING, config.database.options))
			.timeout(5000, "timeout connecting to db")
	}

	async closeConnection () {
		return BPromise.resolve(this.mongoose.connection.close())

	}
}

module.exports = new Database()
