const APIError = require("../core/APIError")
const {authorize} = require("../middlewares/Auth")
const HttpStatusCodes = require("http-status-codes")
const Router = require("../core/Router")
const Response = require("../core/Response")



class BaseController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
    constructor(model) {
        if(!model)
            throw new Error("Please provide a model")

        this._model = model;
        this.create = this.create.bind(this);
        this.readOne = this.readOne.bind(this);
        this.readMany = this.readMany.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async create(req, res, next) {
        try {
            let result = await this._model.create(req.body)
            return new Response({
                status: HttpStatusCodes.CREATED,
                data: result,
                meta: {
                    message: "Record created"
                }
            })
        }catch(err) {
            return APIError.normalize(err)
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async readOne(req, res, next) {
        try {
            let {id} = req.params
            let result = await this._model.findById(id)
            return new Response({
                status: result ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result ? "Record found" : "Record not found"
                }
            })
        }catch(err) {
            return APIError.normalize(err)
        }
    }


    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async readMany(req,res, next) {
        try {
            let result = await this._model.find(res.locals.query)
            return new Response({
                status: result.length ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result.length ? "Record found" : "No record found"
                }
            })
        }catch(err) {
            return APIError.normalize(err)
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async update(req, res, next) {
        try {
            const changedEntry = req.body;
            let result = await this._model.update({_id: req.params.id}, {$set: changedEntry});

            return new Response({
                status: result.nModified ? HttpStatusCodes.OK : HttpStatusCodes.BAD_REQUEST,
                meta: {
                    message: result.nModified ? "Record update" : "Record not updated"
                }
            })
        }catch (err) {
            return APIError.normalize(err)
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async delete(req, res, next) {
        try {
            await this._model.remove({_id: req.params.id});
            return new Response({
                meta: {
                    message: "Record deleted"
                }
            })
        }catch(err) {
            return APIError.normalize(err)
        }
    }

    getRouter({
                  path,
                  middlewares = [],
                  routes = {}
              }) {

        let entity = this._model.instance.constructor.modelName
        let routerMeta = {
            path,
            controller: this,
            routes: {
                GET: {
                    "/": [...middlewares, authorize("read", entity), "readMany"],
                    "/:id": [...middlewares, authorize("read", entity), "readOne"]

                },
                POST: {
                    "/": [...middlewares, authorize("create", entity) ,"create"]
                },
                PUT: {
                    "/:id": [...middlewares, authorize("update", entity),  "update"]
                },
                DELETE: {
                    "/:id": [...middlewares, authorize("delete", entity), "delete"]
                }
            }

        }

        routerMeta.routes = { ...routerMeta.routes, routes }

        return new Router(routerMeta).registerRoutes()

    }

}

module.exports = BaseController