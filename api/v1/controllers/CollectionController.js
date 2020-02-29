const BaseController = require("../../BaseController")

class CollectionController extends BaseController {
    constructor(CollectionService, APIError, Response) {
        let collectionService = new CollectionService()
        super(collectionService, APIError, Response);
    }
}

module.exports = (CollectionService, APIError, Response) => new CollectionController(CollectionService, APIError, Response).getRouter({
    controller: this,
    path: "/v1/collection",
    enity: "collection"
})