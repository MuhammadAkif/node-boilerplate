const UserService = require("./UserService")
const CollectionService = require("./CollectionService")
const ItemService = require("./ItemService")
const GroupService = require("./GroupService")

// Use this file as a DI container
module.exports = {
    UserService: new UserService(),
    CollectionService: new CollectionService(),
    ItemService: new ItemService(),
    GroupService: new GroupService()
}