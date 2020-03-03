const HttpStatusCodes = require("http-status-codes")
const Router = require("../core/Router")
const {authorize, authenticate} = require("../middlewares")



class BaseController {

    constructor(service, APIError, Response) {
        if(!service)
            throw new APIError({
                message: "Service instance required",
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR
            })
        this.service = service;
        this.APIError = APIError;
        this.Response = Response;
        this.create = this.create.bind(this);
        this.readOne = this.readOne.bind(this);
        this.readMany = this.readMany.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res, next) {
        try {
            let result = await this.service.create(req.body)
            return new this.Response({
                status: HttpStatusCodes.CREATED,
                data: result,
                meta: {
                    message: "Record created"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async readOne(req, res, next) {
        try {
            let result = await this.service.readOne(req.params.id)
            return new this.Response({
                status: result ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result ? "Record found" : "Record not found"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }


    async readMany(req,res, next) {
        try {
            let result = await this.service.readMany()
            return new this.Response({
                status: result.length ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result.length ? "Record found" : "No record found"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async update(req, res, next) {
        try {
            const changedEntry = req.body;
            const {id} = req.params
            let result = await this.service.update(id, changedEntry);

            return new this.Response({
                status: result.nModified ? HttpStatusCodes.OK : HttpStatusCodes.BAD_REQUEST,
                meta: {
                    message: result.nModified ? "Record update" : "Record not updated"
                }
            })
        }catch (err) {
            return this.APIError.normalize(err)
        }
    }

    async delete(req, res, next) {
        try {
            const {id} = req.params
            await this.service.delete(id);
            return new this.Response({
                meta: {
                    message: "Record deleted"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    getRouter({
                  path,
                  routes = {},
                  controllerMiddleware = []
              }) {
        let routerMeta = {
            path,
            controller: this,
            routes: {
                GET: {
                    "/": [...controllerMiddleware, authenticate, authorize("read", this.resource), "readMany"],
                    "/:id": [...controllerMiddleware, authenticate, authorize("read", this.resource), "readOne"]

                },
                POST: {
                    "/": [...controllerMiddleware, authenticate, authorize("create", this.resource) ,"create"]
                },
                PUT: {
                    "/:id": [...controllerMiddleware, authenticate, authorize("update", this.resource),  "update"]
                },
                DELETE: {
                    "/:id": [...controllerMiddleware, authenticate, authorize("delete", this.resource), "delete"]
                }
            }
        }

        Object.keys(routes).forEach((action) => {
            if(routerMeta.routes[action]) {
                routerMeta.routes[action] = {...routerMeta.routes[action], ...routes[action]}
            }else {
                routerMeta.routes[action] = routes[action]
            }
        })

        return new Router(routerMeta).registerRoutes()

    }

}

module.exports = BaseController