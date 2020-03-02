const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserService} = require("../services/index")
const {JWT} = require("../core/Utils")


const authenticate = async (req, res, next) => {
    try {
        let token = req["X-Auth"]
        if (!token)
            res.send(HttpStatusCode.FORBIDDEN).json({message: "Auth token is missing"})

        let decodedUser = JWT.verifyToken(token)

        let user = await UserService.findUser({ email: decodedUser.email })

        if(!user)
            return res.status(HttpStatusCode.UNAUTHORIZED).json({message: "Invalid Auth token"})

        req.user = user

        next()

    } catch(err) {
        res.send(APIError.normalize(err))
    }
}

module.exports = { authenticate }
