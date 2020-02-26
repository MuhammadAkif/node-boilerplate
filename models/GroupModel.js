const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Group name is required"],
        index: true
    },
    collectionIds: [String],

});

module.exports = GroupSchema;