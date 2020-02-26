const mongoose = require('mongoose')

const ItemModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Item name is required"],
        index: true
    },
    parentId: {
        type: String,
        required: [true, "Item's collection id is required"]
    }, /// collection id
});

module.exports = ItemModel;