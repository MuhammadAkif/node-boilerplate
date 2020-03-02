const BaseService = require("./BaseService")
const { Collection, Group } = require("../core/Database").models


module.exports = class CollectionService extends BaseService {
    constructor() {
        super(Collection);
    }

    async create(collection, groupId) {
        let createdCollection = super.create(collection)
        if(groupId)
            await Group.addCollectionInGroup(groupId, createdCollection._id)
        return createdCollection
    }
}