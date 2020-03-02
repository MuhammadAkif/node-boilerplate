const {authorize} = require("../middlewares/filtering")
const HttpStatusCodes = require("http-status-codes")
const Router = require("../core/Router")
const BaseService = require("../services/BaseService.js")



class BaseController {

     constructor(service, APIError, Response) {
         if(!service)
             throw new APIError({
                 message: "Service instance required",
                 status: HttpStatusCodes.INTERNAL_SERVER_ERROR
             })
         this.baseService = service;
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
            let result = await this.baseService.create(req.body)
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
            let {id} = req.params
            let result = await this.baseService.readOne(id)
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
            let result = await this.baseService.readMany(res.locals.query)
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
            let result = await this.baseService.update(id, changedEntry);

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
            await this.baseService.delete(id);
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
                  middlewares = [],
                  routes = {},
                  entity
              }) {

            // let entity = this._model.instance.constructor.modelName
        let routerMeta = {
            path,
            controller: this,
            // routes: {
            //     GET: {
            //         "/": [...middlewares, authorize("read", entity), "readMany"],
            //         "/:id": [...middlewares, authorize("read", entity), "readOne"]
            //
            //     },
            //     POST: {
            //         "/": [...middlewares, authorize("create", entity) ,"create"]
            //     },
            //     PUT: {
            //         "/:id": [...middlewares, authorize("update", entity),  "update"]
            //     },
            //     DELETE: {
            //         "/:id": [...middlewares, authorize("delete", entity), "delete"]
            //     }
            // }
            routes: {
                GET: {
                    "/": [...middlewares, "readMany"],
                    "/:id": [...middlewares, "readOne"]

                },
                POST: {
                    "/": [...middlewares, "create"]
                },
                PUT: {
                    "/:id": [...middlewares, "update"]
                },
                DELETE: {
                    "/:id": [...middlewares, "delete"]
                }
            }
        }

        routerMeta.routes = { ...routerMeta.routes, ...routes }

        return new Router(routerMeta).registerRoutes()

    }

}

module.exports = BaseController