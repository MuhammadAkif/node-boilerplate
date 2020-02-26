const BaseController = require("../../BaseController")

class UserController extends BaseController {
    constructor(model) {
        super(model);
    }
}

module.exports = (model) => new UserController(model).getRouter({
    controller: this,
    path: "/v1/user"
})