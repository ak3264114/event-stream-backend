const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const adminUserSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

adminUserSchema.pre('save', function (next) {
    const user = this;
    const saltRounds = Number(process.env.SALT_ROUNDS) || 12;

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

adminUserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

adminUserSchema.statics.checkIfUserExists = async function (email, password) {
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
        return null;
    }
    if (!(await admin.comparePassword(password))) return null;
    return admin.toJSON();
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
module.exports = AdminUser;
