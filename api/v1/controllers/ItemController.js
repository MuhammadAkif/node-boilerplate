const BaseController = require("../../BaseController")

class ItemController extends BaseController {
    constructor(ItemService, APIError, Response) {
        super(ItemService, APIError, Response);
        this.itemService = ItemService
        this.ApiError = APIError
        this.Response = Response
        this.resource = "item"
    }
}

module.exports = (ItemService, APIError, Response) => new ItemController(ItemService, APIError, Response)
    .getRouter({
        controller: this,
        entity: "item",
        path: "/v1/item"
    })