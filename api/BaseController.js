const APIError = require("../core/APIError")
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
                    message: "Record found"
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
                data: result,
                meta: {
                    message: "Record found"
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
            let result = await this._model.find(id)
            return new Response({
                data: result,
                meta: {
                    message: "Record found"
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
            await this._model.update({_id: req.params._id}, {$set: changedEntry});

            return new Response({
                meta: {
                    message: "Record found"
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
        await this._model.remove({ _id: req.params.id });
        return new Response({
            meta: {
                message: "Record found"
            }
        })
    }

    getRouter({
                  path,
                  middlewares = [],
                  routes = {}
              }) {

        let routerMeta = {
            path,
            controller: this,
            routes: {
                GET: {
                    "/:id": [...middlewares, "readOne"],
                    "/": [...middlewares, "readMany"]

                },
                POST: {
                    "/": [...middlewares, "create"]
                },
                PUT: {
                    "/:id": [...middlewares, "update"]
                },
                delete: {
                    "/": [...middlewares, "delete"]
                }
            }

        }

        routerMeta.routes = { ...routerMeta.routes, routes }

        return new Router(routerMeta).registerRoutes()

    }

}

module.exports = BaseController