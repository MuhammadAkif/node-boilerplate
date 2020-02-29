const BaseService = require("./BaseService")
const { Collection } = require("../core/Database").models
const HttpStatusCode = require("http-status-codes")


module.exports = class CollectionService extends BaseService {
    constructor() {
        super(Collection);
    }
}