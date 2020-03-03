const BaseController = require("../../BaseController")
const {authorize, authenticate} = require("../../../middlewares")
const HttpStatusCode = require("http-status-codes")

class UserController extends BaseController {
    constructor(UserService, APIError, Response) {
        super(UserService,APIError, Response);
        this.userService = UserService;
        this.ApiError = APIError;
        this.Response = Response;
        this.resource = "user"

        this.login = this.login.bind(this)
    }

    async login(req, res, next) {
        try {
            let {email} = req.body
            let {user, token} = await this.userService.login(email)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: {user},
                headers: { "authorization": token },
                meta: {
                    message: "Login successful"
                }
            })
        }catch(err){
            return this.ApiError.normalize(err)
        }
    }

    async create(req, res, next) {
        try {
            let userInfo = req.body
            let user = await this.userService.create(userInfo)
            return new this.Response({
                status: HttpStatusCode.CREATED,
                data: user,
                meta: {
                    message: "User created"
                }
            })

        } catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async update(req, res, next) {
        try{
            let userInfo = req.body
            let {id} = req.params
            let user = await this.userService.update(id, userInfo)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: user,
                meta: {
                    message: "User role updated"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async readMany(req, res, next) {
        try{
            let {groupId} = req.query
            let users = await this.userService.readMany(groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: users
            })

        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async readOne(req, res, next) {
        try{
            let {groupId} = req.query
            let {id} = req.params.id
            let users = await this.userService.readMany(id, groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: users
            })

        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async delete(req, res, next) {
        try {

            let {groupId} = req.query
            let {id} = req.params

            //Can add check user cant delete him self

            let users = await this.userService.delete(id, groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: users
            })

        }catch(err) {
            return this.APIError.normalize(err)
        }
    }
}

module.exports = (UserService, APIError, Response) => new UserController(UserService, APIError, Response)
    .getRouter({
        controller: this,
        resource: this.resource,
        path: "/v1/user",
        routes: {
            POST: {
                "/login": ["login"]
            }
        }
    })