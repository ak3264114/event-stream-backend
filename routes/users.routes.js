var express = require('express');
var router = express.Router();
const { validate } = require('express-validation');
const userController = require('../controllers/user');
const tokenHelper = require('../helpers/tokenHelper');
const validations = require('../validations/user.validation');

router.post(
    '/register',
    validate(validations.register, {}, {}),
    userController.register
);

router.post(
    '/login',
    validate(validations.login, {}, {}),
    userController.logIn
);

router.get('/me', tokenHelper.validate, userController.profile);
router.get(
    '/events',
    tokenHelper.validate,
    userController.allParticipatedEvents
);

module.exports = router;
