const BaseController = require("../../BaseController")

class CollectionController extends BaseController {
    constructor(model) {
        super(model);
    }
}

module.exports = (model) => new CollectionController(model).getRouter({
    controller: this,
    path: "/v1/collection"
})