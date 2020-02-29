const BaseController = require("../../BaseController")

class GroupController extends BaseController {
    constructor(GroupService, APIError, Response) {
        let groupService = new GroupService()
        super(groupService, APIError, Response);
    }
}

module.exports =(GroupService, APIError, Response) => new GroupController(GroupService, APIError, Response)
    .getRouter({
        controller: this,
        path: "/v1/group",
        entity: "group"
    })