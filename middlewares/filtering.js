const APIError = require("../core/APIError")
const HttpStatusCode = require("http-status-codes")
const {UserContext} = require("./UserStrategy/strategy")
const {GroupService}  = require("../services")
const mongoose = require("mongoose")
// eslint-disable-next-line no-unused-vars
const {Roles} = require("../core/Utils")


const authorize = (operation, resource) => {
    return async (req, res, next) => {

        let {groupId} = req.query
        if(!groupId && resource === "user")
            groupId = req.body.role ? req.body.role.groupId : null

        let userContext = new UserContext()
            userContext.setStrategy(req.user, groupId)

        if(userContext.user === null || userContext.roleType === null)
            res.status(HttpStatusCode.FORBIDDEN)
                .send({message: "access denied"}).end()

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
        let groupFound = true
        if(userContext.roleType === "globalManager" && groupId) {
            let group = await GroupService.readOne(mongoose.Types.ObjectId(groupId))
            if(!group)
                groupFound = false
        }

        if(!groupFound)
            res.status(HttpStatusCode.NOT_FOUND)
                .send({message: "group not found"}).end()
        else {
            let can = userContext.executeStrategy(operation, resource, req.params.id)
            if (can) {
                next()
            }else {
                res.status(HttpStatusCode.FORBIDDEN)
                    .send({message: "access denied"})
            }
        }
    }
}

module.exports = { authorize }
