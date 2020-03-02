const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Group name is required"],
        index: true
    },
    collectionIds: [String],

});


GroupSchema.statics.verifySingleCollection = function(collectionIds= []) {
    return this.find( { collectionIds: { $in: collectionIds } } ).count()
}

GroupSchema.statics.addCollectionInGroup = async function (groupId, collectionId) {
    await this.update({_id: groupId}, { $push: { collectionIds: collectionId } })
}

module.exports = GroupSchema;