const BaseController = require("../../BaseController")

class CollectionController extends BaseController {
    constructor(model) {
        super(model);
    }

    async create(req, res, next) {

        return super.create(req, res, next);
    }
}

module.exports = (model) => new CollectionController(model).getRouter({
    controller: this,
    path: "/v1/collection"
})