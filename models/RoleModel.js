const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema({
    role: {
        type: String,
        enum : ['regular', 'manager', 'globalManager'],
        default: 'regular',
        required: false,
        index: true
    },
    groupId: {
        type: String,
        required: false
    }, // for globalManager groupId is null

});

module.exports = RoleSchema;