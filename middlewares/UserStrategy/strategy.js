const HttpStatusCode = require("http-status-codes")
const { Roles } = require("../../core/Utils")
class UserContext {
    constructor(){
        this.user = null
        this.roleType = null
    }

    setStrategy(user, groupId) { // group condition
        if(user.roles.length === 1 && user.roles[0].role === "globalManager") {
            this.user = new GlobalManger(user, groupId)
            this.roleType = "globalManager"
        }else {
            user.roles.forEach((role) => {
                if (this.user === null) {
                    if (role.role === "manager" && role.groupId === groupId) {
                        this.user = new Manager(user, groupId)
                        this.roleType = "manager"
                    } else if (role.role === "regular" && role.groupId === groupId) {
                        this.user = new Regular(user, groupId)
                        this.roleType = "regular"
                    }
                }
            })
        }
    }

    executeStrategy(operation, resource, id) {
        if(!operation || !resource)
            throw new APIError({message: "Some information is missing", status:  HttpStatusCode.INTERNAL_SERVER_ERROR })
        return this.user.checkPermission(operation, resource, id)
    }
}

class User {
    constructor(user, groupId = null){
        this.user = user
        this.currentGroupId = groupId
    }

    // isGroupAllowed(roles = []) {
    //     let matchedRoles = roles.filter((role) => {
    //         if(role.groupId === this.currentGroupId) {
    //             return role.groupId
    //         }
    //     })
    //     if(matchedRoles.length)
    //         return true
    //
    //     return false
    // }
}

class GlobalManger extends User {
    constructor(user, groupId) {
        super(user, groupId)
    }

    checkPermission(operation, resource) {
        return true
    }
}

class Manager extends User {
    constructor(user, groupId) {
        super(user, groupId)
    }

    checkPermission(operation, resource) {
        // let isGroupAllowed = this.isGroupAllowed(this.user.roles)
        // if(isGroupAllowed) {
            let operationFound = Roles["manager"][resource].find((allowedOp) => allowedOp === operation)
            if(operationFound)
                return true

            return false
       // }
       // return false
    }
}

class Regular extends User {
    constructor(user, groupId, id) {
        super(user, groupId)
        this.currentUserId = id
    }

    async checkPermission(operation, resource) {
        if (operation == "read") {
            if(this.user._id.toString() === this.currentUserId) {
                let operationFound = Roles["regular"][resource].find((allowedOp) => allowedOp === operation)
                if(operationFound)
                    return true

                return false
            }
            else {
                return false
            }
        }
        return false
    }
}



module.exports = {
    UserContext
}
