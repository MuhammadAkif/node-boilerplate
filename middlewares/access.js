const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserService} = require("../services/index")
const {JWT} = require("../core/Utils")


const authenticate = async (req, res, next) => {
    try {
        //TODO: add password security ( ONLY implemented for POC )
        let token = req.headers["x-auth"]
        if (!token)
            res.send(HttpStatusCode.FORBIDDEN).json({message: "Auth token is missing"}) // call needs to be improved

        let decodedUser = await JWT.verifyToken(token)

        let user = await UserService.findUser({ email: decodedUser.data })

        if(!user)
            return res.status(HttpStatusCode.UNAUTHORIZED).json({message: "Invalid Auth token"})

        req.user = user

        next()

    } catch(err) {
        res.send(HttpStatusCode.FORBIDDEN)
    }
}

module.exports = { authenticate }
