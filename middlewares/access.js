const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserService} = require("../services/index")
const {JWT} = require("../core/Utils")


const authenticate = async (req, res, next) => {
    try {
        //TODO: add password security ( ONLY implemented for POC )
        let token = req.headers["x-auth"]
        if (!token)
           throw new APIError({ message: "Auth token is missing", status:  HttpStatusCode.FORBIDDEN })// call needs to be improved

        let decodedUser = await JWT.verifyToken(token)

        let user = await UserService.findUser({ email: decodedUser.data })

        if(!user)
            throw new APIError({ message: "Invalid Auth token", status:  HttpStatusCode.FORBIDDEN })

        req.user = user

        next()

    } catch(err) {
        throw new APIError({ message: "Invalid Auth token", status:  HttpStatusCode.FORBIDDEN })
    }
}

module.exports = { authenticate }
