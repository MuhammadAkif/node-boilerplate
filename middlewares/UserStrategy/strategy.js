const _ = require("lodash")
class UserContext {

    constructor(){
        this.user = null
        this.roleType = null
    }

    setStrategy(user, roles) {
        user.roles.forEach((role) => {
            if(this.user === null || this.user.role === "regular") {
                if (role.role === "globalManager") {
                    this.user = new GlobalManger(user, roles)
                    this.roleType = "globalManager"
                }
                else if(role.role === "manager") {
                    this.user = new Manager(user, roles)
                    this.roleType = "manager"
                }
                else if(role.role === "regular") {
                    this.user = new Regular(user, roles)
                    this.roleType = "regular"
                }
            }
        })
    }

    executeStrategy(req, operation, entity) {
        this.user.checkPermission(req, operation, entity)
    }
}

class User {
    constructor(user, roles){
        this.user = user
        this.roles = roles
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
    constructor(user, roles) {
      super(user, roles)
    }

    checkPermission(req, operation, entity) {
        return true
    }
}

class Manager extends User {
    constructor(user, roles) {
        super(user, roles)
    }

    async checkPermission(req,  operation, entity) {
       let groupId = req.query.groupId
       let managerOfGroups = this.extractGroupAllowed(this.user.roles)
       if(managerOfGroups.indexOf(groupId) !== -1) {
           let can = this.roles["manager"][entity].indexOf(operation) !== -1
           return can
       }
    }
}

class Regular extends User {
    constructor(user) {
        super(user, roles)
    }

    async checkPermission(req, operation, entity) {
       let {id} = req.params.id
       if (operation == "read"
            ||
            operation == "update"
        ) {
            if(this.user._id.toString() === id) {
                let can = this.roles["regular"][entity].indexOf(operation) !== -1
                return can
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
