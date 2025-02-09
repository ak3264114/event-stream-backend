const jwt = require('jsonwebtoken');
const configConsts = require('../config/constants');
exports.sign = (payload) => {
    let expiresIn = configConsts.AUTH_TOKEN_EXPIRY_HOURS;
    if (payload.status != configConsts.USER_STATUS.ACTIVE) {
        expiresIn = expiresIn / 2;
    }
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: expiresIn + 'h'
    });
};

exports.signEmailVerificationToken = (payload) => {
    const expiresIn = configConsts.EMAIL_TOKEN_EXPIRY_HOURS;
    return jwt.sign(payload, process.env.EMAIL_VERIFICATION_TOKEN_SECRET, {
        expiresIn: expiresIn + 'h'
    });
};
exports.verifyEmailverificationToken = (token) =>
    new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
            function (err, decoded) {
                if (err) {
                    return reject(err.message);
                } else {
                    resolve(decoded);
                }
            }
        );
    });

exports.verify = (token) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
            if (err) {
                return reject(err.message);
            } else {
                resolve(decoded);
            }
        });
    });

exports.validate = (req, res, next) => {
    const token = req.headers['authorization'];
    // console.log(token)

    if (token) {
        exports
            .verify(token)
            .then((user) => {
                req.user = user;
                next();
            })
            .catch((err) => {
                return res.status(200).json({
                    err: true,
                    msg: err.message,
                    logout: true
                });
            });
    } else {
        return res.status(200).json({
            err: true,
            msg: 'no token supplied',
            logout: true
        });
    }
};
