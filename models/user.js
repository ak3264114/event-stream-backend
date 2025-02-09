const mongoose = require('mongoose');
const configConsts = require('../config/constants');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: { type: String, default: null },
        phone: { type: String, required: true, unique: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },

        status: {
            type: String,
            default: configConsts.USER_STATUS.ACTIVE,
            enum: Object.values(configConsts.USER_STATUS)
        },
        isEmailVerified: { type: Boolean, default: false },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

userSchema.pre('save', function (next) {
    const user = this;
    const saltRounds = 12;

    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

userSchema.pre('findOneAndUpdate', function (next) {
    const user = this.getUpdate();
    const saltRounds = 12;
    if (user.$set.password) {
        bcrypt.hash(user.$set.password, saltRounds, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.$set.password = hash;
            next();
        });
    } else {
        return next();
    }
});

userSchema.statics.checkIfUserExists = function (username, kind) {
    const where = {
        status: {
            $nin: [
                configConsts.USER_STATUS.BLOCKED,
                configConsts.USER_STATUS.DELETED
            ]
        }
    };

    if (!kind) {
        where['email'] = username;
    } else {
        where[kind] = username;
    }
    console.log(where);
    return User.findOne(where);
};

userSchema.statics.checkIfDuplicateCredentials = function (userId, cred, kind) {
    const where = {
        _id: {
            $ne: mongoose.Types.ObjectId(userId)
        },
        [kind]: cred
    };
    return User.findOne(where);
};
userSchema.statics.getUserById = (userId) => {
    return User.findOne({
        _id: userId
    });
};

userSchema.statics.getValidUserById = (userId) => {
    return User.findOne({
        _id: userId,
        status: configConsts.USER_STATUS.ACTIVE
    });
};

// userSchema.statics.createUser = async (phone) => {
// 	const user = new User({
// 		phone,
// 		email: uniqid("unknown-email-") + randomstring.generate(),
// 		drivingLicense: uniqid("unknown-dl-"),
// 		aadhaarNumber: uniqid("unknown-aadhaar-"),
// 	});
// 	await user.save();
// 	return user;
// };

userSchema.statics.addUser = async function ({ name, phone, email, password }) {
    const newUser = new User({
        name,
        phone,
        email,
        password: password,
        status: configConsts.USER_STATUS.ACTIVE,
        isEmailVerified: false
    });

    await newUser.save();
    return newUser;
};

userSchema.methods.matchPassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.updateUser = (userId, update, query = {}) => {
    return User.findOneAndUpdate(
        {
            _id: userId,
            ...query
        },
        {
            $set: update
        },
        { new: true }
    );
};

userSchema.statics.removeUser = (userId) => {
    return User.findOneAndUpdate(
        {
            _id: userId
        },
        {
            $set: {
                status: configConsts.USER_STATUS.BLOCKED
            }
        },
        { new: true }
    );
};

const User = mongoose.model('User', userSchema);
module.exports = User;
