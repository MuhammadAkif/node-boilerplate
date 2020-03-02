class UserContext {
    constructor(){
        this.user = null
        this.roleType = null
    }

    setStrategy(user, groupId) { // group condition
        if(user.roles.length === 1 && !user.roles[0].role === "globalManager") {
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
        this.user.checkPermission(operation, resource, id)
    }
}

class User {
    constructor(user, groupId){
        this.user = user
        this.currentGroupId = groupId
    }

    extractGroupAllowed(roles = []) {
        //use reduce
        return roles.map((role) => {
            if(role === "manager") {
                return role.groupId
            }
        })
    }
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
    constructor(user, roles) {
        super(user, roles)
    }

    async checkPermission(operation, resource) {
        let groupId = this.currentGroupId
        let managerOfGroups = this.extractGroupAllowed(this.user.roles)
        if(managerOfGroups.indexOf(groupId) !== -1) {
            let operationFound = this.roles["manager"][resource].find((allowedOp) => allowedOp === operation)
            if(operationFound)
                return true

            return false
        }
    }
}

class Regular extends User {
    constructor(user, groupId, id) {
        super(user, groupId)
        this.currentUserId = id
    }

    async checkPermission(operation, resource) {
        if (operation == "read"
            ||
            operation == "update"
        ) {
            if(this.user._id.toString() === this.currentUserId) {
                let operationFound = this.roles["regular"][resource].find((allowedOp) => allowedOp === operation)
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
