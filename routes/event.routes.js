const express = require('express');
const router = express.Router();
const { validate } = require('express-validation');
const eventController = require('../controllers/event');
const validations = require('../validations/event.validation');
const tokenHelper = require('../helpers/tokenHelper');

router.get(
    '/list',
    validate(validations.allEvents, { context: true }, {}),
    eventController.getAllEvents
);

router.get(
    '/',
    validate(validations.singleEvent, {}, {}),
    eventController.getEventById
);
router.post(
    '/participate',
    tokenHelper.validate,
    validate(validations.validateParticipationReq, {}, {}),
    eventController.participateInEvent
);

module.exports = router;
