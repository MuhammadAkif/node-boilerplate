const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserContext} = require("./UserStrategy/strategy")
// eslint-disable-next-line no-unused-vars
const {Roles} = require("../core/Utils")


const authorize = (operation, resource) => {
    return function (req, res, next) {

        let {groupId} = req.query
        if(!groupId && resource === "user")
            groupId = req.body.role.groupId

        let userContext = new UserContext()
            userContext.setStrategy(req.user, groupId)

        if(userContext.user === null || userContext.roleType === null)
            throw new APIError({message: "access denied", status: HttpStatusCode.FORBIDDEN })


        // res.locals.query = {}
        // if(
        //     groupId && userContext.roleType === "globalManager"
        //     ||
        //     groupId && userContext.roleType === "manager"
        //
        // ) {
        //     res.locals.query = { groupId }
        // }

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
