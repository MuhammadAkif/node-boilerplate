// const ApiError = require("../core/APIError")
// const httpStatus = require("http-status-codes")
// const jwt = require("jsonwebtoken")
// const md5 = require("md5")
const mongoose = require('mongoose')
// const {JWT} = require("../core/Utils")

const validateEmail = function(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        unique: 'This email has been taken',
        trim: true,
        index: true,
        lowercase: true,
        validate: [validateEmail, 'Please provide a valid email address'],
        index: true
    },
    roles: [{
        role: {
            type: String,
            enum : ['regular', 'manager', 'globalManager'],
            required: [true, "Role name is required"],
            index: true
        },
        groupId: {
            type: String,
            required: false,
            default: null
        }
    }]
});

UserSchema.statics.findUser = async function (query = {}) {
    let user = await this.findOne(query).lean()
    return user
}

UserSchema.statics.addNewRole = async function (id, role) {
    await this.update({_id: id}, {$push: {roles: role}},)
}

UserSchema.statics.updateExistingRole = async function(id, roles) {

}

UserSchema.statics.deleteUser = async function(query) {
    let result = await this.deleteMany(query)
    console.log(result)
}

UserSchema.path('roles').validate(function (roles) {
    return true
})

module.exports = UserSchema;
