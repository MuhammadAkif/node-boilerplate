const BaseController = require("../../BaseController")
const HttpStatusCode = require("http-status-codes")

class CollectionController extends BaseController {
    constructor(CollectionService, APIError, Response) {
        super(CollectionService, APIError, Response);
        this.collectionService = CollectionService
        this.ApiError = APIError
        this.Response = Response
        this.resource = "collection"
    }

    async create(req, res) {
        try {
            let {groupId} = req.query
            let collection = await this.collectionService.create(req.body, groupId)
            return new this.Response({
                status: HttpStatusCode.CREATED,
                data: collection,
                meta: {
                    message: "collection created"
                }
            })
        } catch (err) {
            return this.ApiError.normalize(err)
        }
    }

    async readMany(req, res) {
        try {
            let {groupId} = req.query
            let collections = await this.collectionService.readMany(groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: collections
            })
        } catch (err) {
            return this.ApiError.normalize(err)
        }
    }

    async readOne(req, res) {
        try {
            let {id} = req.params
            let {groupId} = req.query
            let collection = await this.collectionService.readOne(id, groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: collection
            })
        } catch (err) {
            return this.ApiError.normalize(err)
        }
    }

    async delete(req, res) {
        try {
            let {id} = req.params
            let {groupId} = req.query
            let collection = await this.collectionService.delete(id, groupId)
            return new this.Response({
                status: HttpStatusCode.OK,
                data: collection
            })
        } catch (err) {
            return this.ApiError.normalize(err)
        }
    }
}

module.exports = (CollectionService, APIError, Response) => new CollectionController(CollectionService, APIError, Response)
    .getRouter({
    controller: this,
    path: "/v1/collection",
    entity: "collection"
})