const BaseService = require("./BaseService")
const { Item } = require("../core/Database").models
const HttpStatusCode = require("http-status-codes")


module.exports = class ItemService extends BaseService {
    constructor() {
        super(Item);
    }
}