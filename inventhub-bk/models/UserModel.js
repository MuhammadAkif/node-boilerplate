const ApiError = require("../core/APIError")
const httpStatus = require("http-status-codes")
const jwt = require("jsonwebtoken")
const md5 = require("md5")
const mongoose = require('mongoose')
const {JWT} = require("../core/Utils")
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const validateEmail = function(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

const UserSchema = new mongoose.Schema({
    coordinates: {
        type: [Number]
    },
    city: {
        type: String,
    },
    country: {
        type: String
    },
    biography: {
        type: String,
        maxlength: 1000,
        default: null
    },
    skills: [],
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        unique: 'This email has been taken',
        trim: true,
        index: true,
        lowercase: true,
        validate: [validateEmail, 'Please provide a valid email address']
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    loginType: {
        type: String
    },
    loginPlatform: {
        type: String
    },
    mobile: {
        type: String,
        unique: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        maxlength: 20
    },
    lastName: {
        type: String,
        maxlength: 20
    },
    password: {
        type: String
    },
    profilePictureUrl: {
        type: String
    },
    socialProfileUrl: {
        type: String
    },
    username: {
        type: String,
        required: [true, 'Please provide your username'],
        unique: 'This username has been taken',
        trim: true,
        index: true,
        minlength: 5,
        maxlength: 60,
        lowercase: true
    },
    oldEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validateEmail, 'Please provide a valid email address']
    },
    requestedEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validateEmail, 'Please provide a valid email address']
    },
    userId: {
      type: String,
      index: true,
      required: [true, 'Please provide user id'],
    },
    inviteInformation: {
        code: {
            type: String,
            index: true,
            default: ""
        },
        invitesSent: {
            type: Number,
            default: 0
        },
        inviteToken: String
    },
    invitedBy: {
        code: String,
        userId: String
    },
    billingInformation: {
        paymentMethods: [{
            isDefault: {
                type: Boolean
            },
            card: {
                type: String
            },
            isCard: {
                type: Boolean
            },
            account: {
                type: String
            },
            stripeToken: {
                type: String
            }
        }]
    },
    customerStipeId: {
        type: String
    },
    planSubscribedOn: {
        type: Date
    },
    planName: {
        type: String
    },
    numOfCollabs: {
        type: Number
    },
    numOfPrivateRepos: {
        type: Number
    },
    renewalDate: {
        type: Date
    }
});

UserSchema.statics.create = async function(data, session) {
    const user = new this(data)
    if(session)
        return user.save({session})
    else
        return user.save()
}
UserSchema.statics.updateUser = async function(data) {
    return this.updateOne({
        userId: data.userId
    }, {
        $set: data
    })
}
UserSchema.statics.updateUserEmail = async function(data) {
    return this.updateOne({
        _id: data._id
    }, {
        $set: data
    })
}
UserSchema.statics.getAll = async function(_id) {
    return this.find({_id: {$nin: [mongoose.Types.ObjectId(_id)]}}).select(['-password','-email'])
}
UserSchema.statics.findUser = async function(query) {
    const where = {}
    if(query.username) where.username = query.username
    if(query.email) where.email = query.email
    if(query.userId) where.userId = query.userId
    return this.findOne(where).select(['-password', '-inviteInformation'])
}
UserSchema.statics.activate = async function(data) {
    return this.updateOne({
        userId: data.userId
    }, {
        $set: {
            isActive: data.isActive
        }
    })
}
UserSchema.statics.search = async function(query) {
    let {searchText, page, pageSize} = query
    let pagingOts = {
        page,
        limit: pageSize,
        lean:  true,
        sort: { createdAt: -1 }
    }
    return this.find({
        username: {
            $regex: searchText,
            $options: 'i'
        }
    }).select(['-password', '-email']).lean()


}
UserSchema.statics.verifyUserByEmailPassword = async function (email, password) {
    email = email.toLowerCase()
    let user = await this.findOne({
        $or: [{email: email}, {username: email}]
    })
    if(!user)
        throw new ApiError({ message:"User not found", status: httpStatus.UNAUTHORIZED });
    return new Promise((resolve, reject) => {
        password = md5(password)
        if (password !== user.password)  {
            reject(new ApiError({
                message: 'Incorrect password. Please try again',
                status: httpStatus.UNAUTHORIZED
            }))
        }
        resolve(user)
    })

}
UserSchema.statics.verifyUserByEmail = async function (email, userId) {
    return this.findOne({email, userId})
}
UserSchema.statics.verifyUserSecondEmail = async function (email, userId) {
    return this.findOne({requestedEmail: email, userId})
}
UserSchema.statics.verifyUserToken = async function(token) {
    try {
        return await JWT.verifyJWTToken(token)
    } catch(err) {
      if(err === "jwt expired")
        throw new ApiError({
          status: httpStatus.BAD_REQUEST,
          message: "Your verification Link has been expired"
        })
        throw new ApiError({
            status: httpStatus.UNAUTHORIZED,
            message: "Invalid User token"
        })
    }
}
UserSchema.methods.generateAuthToken = function (expiry = "12h") {
    const user = this
    return jwt.sign({
        email: user.email,
        userId: user.userId
    }, process.env.HASH_SALT, {
        expiresIn: expiry
    }).toString()
}
UserSchema.statics.generateInviteToken = async function(code, userId) {
    let token = await jwt.sign({
        inviteCode : code,
        userId
    }, process.env.INVITE_SALT, {
        expiresIn: -1
    }).toString()
    return token
}
UserSchema.statics.findUserByInviteCode = async  function(inviteCode) {
    return this.findOne({
        "inviteInformation.code": inviteCode,
        "inviteInformation.invitesSent": { $lt: process.env.MAX_INVITE_SENT }
    })
}
UserSchema.statics.findUsername = async  function(username) {
    return this.find({
        username: {
            $regex: username,
            $options: 'i'
        }
    }).select(['_id', 'username', 'name', 'email', 'profilePictureUrl', 'userId'])
}

UserSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = md5(this.password)
        next();
    } else {
        return next();
    }
});

UserSchema.statics.addPaymentMethod = async function (_id, payment) {
    return this.updateOne({
        _id
    }, {
        $push: {
            'billingInformation.paymentMethods': payment
        }
    })
}

UserSchema.set('autoIndex', false);

UserSchema.plugin(beautifyUnique);

module.exports = UserSchema;
