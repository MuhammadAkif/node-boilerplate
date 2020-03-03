const { Email } = require("../subscribers")
const BaseService = require("./BaseService")
let Database = require("../core/Database")
const { User } = Database.models
const { JWT }= require("../core/Utils")
const HttpStatusCode = require("http-status-codes")


module.exports = class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async login(email) {
        let user = await User.findUser({email})
        if(!user)
            throw { message: "User not found",  status: HttpStatusCode.NOT_FOUND}
        let token = await JWT.createToken(email)

        return {
            user, token
        }
    }

    async create(data) {
        let {email, role} = data
        let user = await User.findUser({email})
        if (user) {
            throw {message: "User already exists", status: HttpStatusCode.CONFLICT}
        }

        const newUser = {
            email,
            roles: [role]
        }

        let newCreatedUser = await super.create(newUser)
        /*
         * Used pub/sub to handle background process.
         * */
        Email.emit("sendEmail", email)
        return newCreatedUser
    }

    async update(id, data) {
        let {email, role} = data
        let user = await User.findUser({email})
        if (user) {
            /*
            *  i)   if user is a global manager then return conflict
            *  ii   else check if user has already a role in that group
            *  iii) else push the role in existing array.
            * */
            let isGlobalManager = false;
            let userRoles = user.roles;
            if(userRoles.length === 1 && !userRoles[0].groupId) {
                isGlobalManager = true
            }
            if(isGlobalManager)
                throw { message: "User is already a global manager", status: HttpStatusCode.CONFLICT }

            let roleFound = userRoles.filter((role) => role.groupId === data.role.groupId).length
            if(roleFound)
                throw { message: "User can only have one role in a group" }

            let updatedUser = await User.addNewRole(id, role)
            return updatedUser

        } else {
            throw  {message: "User not found", status: HttpStatusCode.NOT_FOUND}
        }
    }

    async readMany(groupId = null) {
        let query = {}
        if(groupId)
            query = { roles: { $elemMatch: { groupId } } }
        return super.readMany(query)
    }

    async readOne(id, groupId = null) {
        let query = {}
        if(groupId) {
            query = {
                $and: [
                    {roles: {$elemMatch: {groupId}}},
                    {_id: Database.mongoose.Types.ObjectId(id)}
                ]
            }
        }
        return await User.findUser(query)
    }

    async delete(id, groupId = null) {
        let query = {}
        if(groupId)  {
            query = {
                $and: [
                    {roles: {$elemMatch: {groupId}}},
                    {_id: Database.mongoose.Types.ObjectId(id)}
                ]
            }
        }
        return await User.deleteUser(query)
    }

    async findUser(query) {
        let user = await User.findUser(query)
        return user
    }

}