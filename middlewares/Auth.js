const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
//const models = require("../core/Database").models
const {UserContext} = require("./UserStrategy/strategy")
const {Roles} = require("../core/Utils")


const authorize = async (operation, entity) => {
    let userContext = new UserContext().setStrategy(req.user, Roles)
    return function (req, res, next) {
        if(req.query.groupId && userContext.roleType === "globalManager") {
            res.locals.query = { groupId: req.query.groupId }
        }else {
            res.locals.query = {}
        }
        if(req.query.groupId && userContext.roleType === "manager") {
            res.locals.query = { groupId: req.query.groupId }
        }else {
            throw new APIError({ message: "no group id provided", status: HttpStatusCode.BAD_REQUEST })
        }
        let can = userContext.executeStrategy(req, operation, entity)
        if(can) {
            next()
        }
        else{
            throw new APIError({ message: "access denied", status: HttpStatusCode.FORBIDDEN })
        }

    }
}

module.exports = { authorize }
