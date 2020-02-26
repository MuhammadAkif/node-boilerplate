const BaseController = require("../../BaseController")

class GroupController extends BaseController {
    constructor(model) {
        super(model);
    }
}

module.exports = (model) => new GroupController(model).getRouter({
    controller: this,
    path: "/v1/group"
})