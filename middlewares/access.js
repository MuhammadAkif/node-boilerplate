const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserService} = require("../services/index")
const {JWT} = require("../core/Utils")


const authenticate = async (req, res, next) => {
        //TODO: add password security ( ONLY implemented for POC )
        let token = req.headers["x-auth"]
        if (!token)
            res.status(HttpStatusCode.FORBIDDEN)
            .send({message: "No auth token"})


        let decodedUser = await JWT.verifyToken(token)

        let user = await UserService.findUser({ email: decodedUser.data })

        if(!user)
            res.status(HttpStatusCode.FORBIDDEN)
                .send({message: "Invalid Token"})

        req.user = user

        next()
}

module.exports = { authenticate }
