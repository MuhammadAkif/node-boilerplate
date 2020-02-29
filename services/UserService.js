const { Email } = require("../subscribers")
const BaseService = require("./BaseService")
const { User } = require("../core/Database").models
const { JWT }= require("../core/Utils")
const HttpStatusCode = require("http-status-codes")


module.exports = class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async login(email) {
        let user = await User.findUserByEmail(email)
        let token = await JWT.createToken(email)
        /*
            Use pub/sub to handle background process.
         */
        Email.emit("sendEmail", email)
        return {
            user, token
        }
    }

    async create(data) {
        try {
            let {email, role} = data
            let user = await User.findUserByEmail(email)
            let newUser = {
                email,
                roles: [role]
            }
            if (!user) {
                newUser = await super.create(newUser)

                return newUser
            } else {
                throw {message: "User already exists", status: HttpStatusCode.CONFLICT}
            }
        } catch (err) {
            return err
        }
    }

    async update(id, data) {
        try {
            let {email, role} = data
            let user = await User.findUserByEmail(email)
            if (user) {
                let updatedUser = await User.addNewRole(id, role)
                return updatedUser
            } else {
                throw  {message: "User not found", status: HttpStatusCode.NOT_FOUND}
            }
        } catch (err) {
            return err
        }
    }

}