const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
//const models = require("../core/Database").models
const {UserContext} = require("./UserStrategy/strategy")
const {Roles} = require("../core/Utils")


const authorize = async (operation, resource) => {
    return function (req, res, next) {
        if(!req.query.groupId)
            throw new APIError({ message: "no group id provided", status: HttpStatusCode.BAD_REQUEST })

        let {groupId} = req.query

        let userContext = new UserContext().setStrategy(req.user, groupId)

        res.locals.query = {}
        if(
            req.query.groupId && userContext.roleType === "globalManager"
            ||
            req.query.groupId && userContext.roleType === "manager"

        ) {
            res.locals.query = { groupId: req.query.groupId }
        }

        //check group id on top

        let can = userContext.executeStrategy(operation, resource, req.params.id)
        if(can) {
            next()
        }
        else {
            throw new APIError({ message: "access denied", status: HttpStatusCode.FORBIDDEN })
        }
    }
}

module.exports = { authorize }
