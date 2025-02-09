/* eslint-disable no-empty */
const User = require('../models/user');
const tokenHelper = require('../helpers/tokenHelper');
const configConsts = require('../config/constants');
const { CustomError } = require('../helpers/errorHelper');
const { sendVerificationEmail } = require('../helpers/emailHelper.js');
const EventParticipation = require('../models/eventParticipation');

exports.register = async (req, res, next) => {
    const { email, phone, password, name } = req.body;
    try {
        const existingEmail = await User.checkIfUserExists(email, 'email');
        const existingPhone = await User.checkIfUserExists(phone, 'phone');
        if (existingEmail) {
            throw new CustomError('User with this  email already exists', 400);
        }
        if (existingPhone) {
            throw new CustomError('User with this phone already exists.', 400);
        }
        const user = await User.addUser({ name, phone, email, password });
        await sendVerificationEmail(user);
        return res.status(201).json({
            err: false,
            token: tokenHelper.sign({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                status: user.status,
                email: user.email
            }),
            user: user
        });
    } catch (error) {
        next(error);
    }
};

exports.logIn = async (req, res, next) => {
    const reqUser = {
        email: req.body.email,
        password: req.body.password
    };
    try {
        if (!reqUser.email || !reqUser.password)
            throw new CustomError('Bad Request');
        const user = await User.checkIfUserExists(reqUser.email, 'email');
        if (!user || !(await user.matchPassword(reqUser.password))) {
            throw new CustomError('Incorrect username or password.');
        }
        if (user.status == configConsts.USER_STATUS.BLOCKED) {
            throw new CustomError('You have been blocked from this platform');
        }
        if (user.status == configConsts.USER_STATUS.DELETED) {
            throw new CustomError('You are not allowed to use this platform');
        }

        return res.status(200).json({
            err: false,
            token: tokenHelper.sign({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                status: user.status,
                email: user.email
            }),
            user: user
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

exports.profile = async (req, res, next) => {
    try {
        const user = await User.getUserById(req.user._id);
        if (!user) throw new CustomError('Invalid Token');
        res.status(200).json({ err: false, user });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

exports.verifyUser = async (request, response, context) => {
    const { record } = context;
    const user = await User.verify(record.params._id);
    await sendVerificationEmail(user).catch(console.error);

    return {
        notice: {
            message: 'User verified successfully.',
            type: 'success'
        }
    };
};

exports.deleteUser = async (request, response, context) => {
    const { record } = context;
    await User.removeUser(record.params._id);

    return {
        notice: {
            message: 'Successfully deleted user.',
            type: 'success'
        }
    };
};

exports.defaultActiveUsersOnly = (request) => {
    const { query = {} } = request;
    if (!query['filters.status']) {
        query['filters.status'] = configConsts.USER_STATUS.ACTIVE;
    }
    const newQuery = {
        ...query
    };

    request.query = newQuery;

    return request;
};

exports.allParticipatedEvents = async (req, res, next) => {
    try {
        const events = await EventParticipation.findByUserIdWithEventDetails(
            req.user._id
        );
        res.status(200).json({ err: false, events });
    } catch (e) {
        console.log(e);
        next(e);
    }
};
