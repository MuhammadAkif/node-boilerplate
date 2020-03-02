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

module.exports = GroupSchema;