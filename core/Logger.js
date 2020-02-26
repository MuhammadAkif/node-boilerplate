const { createLogger, format, transports } = require("winston")
const { combine, timestamp, label, printf, colorize } = format

class Logger {

	getDefaultLoggerOptions() {
		return {
			console: {
				level: process.env.LOGGER_LEVEL,
				handleExceptions: true,
				format:combine(
					label({ label: "API" }),
					colorize(),
					timestamp(),
					printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
				),
				json: false
			}
		}
	}

	logger(options = this.getDefaultLoggerOptions()) {
		const logger =  new createLogger({
			transports: [
				new transports.Console(options.console)
			],
			exitOnError: false // do not exit on handled exceptions
		})
		logger.stream = {
			write: function(message) {
				logger.info(message)
			}
		}
		return logger
	}

}


module.exports = new Logger()
