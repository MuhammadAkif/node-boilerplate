const BaseController = require("../../BaseController")

class ItemController extends BaseController {
    constructor(model) {
        super(model);
    }
}

module.exports = (model) => new ItemController(model).getRouter({
    controller: this,
    path: "/v1/item"
})