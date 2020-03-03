const BaseService = require("./BaseService")
const Database = require("../core/Database")
const { Collection, Group } = Database.models
const HttpStatusCode = require("http-status-codes")



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

    async readMany(groupId = null) {
        let query = {}
        if(groupId) {
            query = {_id: Database.mongoose.Types.ObjectId(groupId)}
            let group = await Group.find(query)
            let collIds = group.collectionIds.map((id) => Database.mongoose.Types.ObjectId(id))
            let collections = await Collection.find({_id: {$in: collIds }})
            return collections
        } else {
            return super.readMany(query)
        }
    }

    async readOne(colId, groupId = null) {
        let query = {}
        if(groupId) {
            query = {_id: Database.mongoose.Types.ObjectId(groupId)}
            let group = await Group.find(query)
            let collId = group.collectionIds.filter((id) => colId === id)
            let collections = await Collection.find({ _id: Database.mongoose.Types.ObjectId(collId) })
            return collections
        } else {
            return super.readMany(query)
        }
    }

    async delete(colId, groupId) {
        if(!groupId)
            throw new {message: "group id is required", status: HttpStatusCode.BAD_REQUEST }


    }
}