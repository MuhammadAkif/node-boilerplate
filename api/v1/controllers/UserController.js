const BaseController = require("../../BaseController")
const {authorize} = require("../../../middlewares/Auth")
const HttpStatusCode = require("http-status-codes")

class UserController extends BaseController {
    constructor(UserService, APIError, Response) {
        let userService = new UserService()
        super(userService,APIError, Response);
        this.userService = userService;
        this.ApiError = APIError;
        this.Response = Response;

        this.login = this.login.bind(this)
        this.create = this.create.bind(this)
        this.update = this.update.bind(this)
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
            let user = await this.userService.update(userInfo)
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
}

module.exports = (UserService, APIError, Response) => new UserController(UserService, APIError, Response)
    .getRouter({
        controller: this,
        entity: "user",
        path: "/v1/user",
        routes: {
            POST: {
                "/login": ["login"],
                "/": ["create"]
            },
            PUT: {
                "/:id" : ["update"]
            }
        }
    })