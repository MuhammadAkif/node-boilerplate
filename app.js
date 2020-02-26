

const APIServer = require("./core/APIServer")
const utils = require("./core/Utils")





const server = new APIServer()

process.on("SIGINT", shutdownAndGoHome)
process.on("SIGTERM", shutdownAndGoHome)

process.on("uncaughtException", (err) => {
	utils.logger.error("uncaught exception", err)
	//shutdownAndGoHome(1)
})

process.on("unhandledRejection", (reason, p) => {
	utils.logger.error(`unhandled rejection:, ${p}, ${reason}`)
})


async function shutdownAndGoHome (c = 0) {
	try {
		await server.stop()
		utils.logger.info("manually shutting down server")

		process.exit(c)
	} catch (err) {
		//console.log(`error stopping server ${err}`)
		utils.logger.error(`error stopping server ${err}`)
		process.exit(c)
	}
}

(async function(){
	try {
		await server.start()
	} catch (err) {
		utils.logger.error(`unhandled rejection:,  ${err.message} ${err.stack}`)
		shutdownAndGoHome(1)
	}
})()

