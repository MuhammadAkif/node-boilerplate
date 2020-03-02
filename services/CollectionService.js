const BaseService = require("./BaseService")
const Database = require("../core/Database")
const { Collection, Group } = Database.models



module.exports = class CollectionService extends BaseService {
    constructor() {
        super(Collection);
    }

    async create(collection, groupId) {
        //TODO: transactions needed to be implemented.
        let createdCollection = await super.create(collection)
        if(groupId) {
            groupId = Database.mongoose.Types.ObjectId(groupId)
            await Group.addCollectionInGroup(groupId, createdCollection._id)
        }
        return createdCollection
    }
}