const { Joi } = require('express-validation');
const { EVENT_STATUS, EVENT_TIME_STATUS } = require('../config/constants');

exports.singleEvent = {
    query: Joi.object({
        id: Joi.string().min(3),
        slug: Joi.string().min(3)
    }).custom((value, helper) => {
        if (!value.id && !value.slug) {
            return helper.message('Either id or slug must be provided');
        }
        return value;
    })
};

exports.allEvents = {
    query: Joi.object({
        search: Joi.string().min(3),
        status: Joi.string().valid(...Object.values(EVENT_STATUS)),
        sortBy: Joi.string().valid('updatedAt', 'from', 'to'),
        orderBy: Joi.string().valid('desc', 'asc'),
        page: Joi.number().min(1).max(100).required(),
        timeStatus: Joi.string().valid(...Object.values(EVENT_TIME_STATUS))
    })
};

exports.validateParticipationReq = {
    body: Joi.object({
        eventId: Joi.string().min(5).required()
    })
};

exports.attemptQuestion = {
    body: Joi.object({
        selectedOption: Joi.array(),
        isMarkedForReview: Joi.boolean().required()
    })
};
