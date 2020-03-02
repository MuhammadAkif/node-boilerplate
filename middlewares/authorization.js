const {authenticate} = require("./access")
const {authorize} = require("./filtering")

module.exports = {
    authorize,
    authenticate
}