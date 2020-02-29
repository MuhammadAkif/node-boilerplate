const BaseService = require("./BaseService")
const { Group } = require("../core/Database").models
const HttpStatusCode = require("http-status-codes")


module.exports = class GroupService extends BaseService {
    constructor() {
        super(Group);
    }

}