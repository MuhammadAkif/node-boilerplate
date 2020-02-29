const BaseController = require("../../BaseController")

class ItemController extends BaseController {
    constructor(ItemService, APIError, Response) {
        let itemService = new ItemService()
        super(itemService, APIError, Response);
    }
}

module.exports = (ItemService, APIError, Response) => new ItemController(ItemService, APIError, Response)
    .getRouter({
        controller: this,
        entity: "item",
        path: "/v1/item"
    })