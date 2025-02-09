const {
    EVENTS_PAGINATION_LIMIT,
    EVENT_TIME_STATUS
} = require('../config/constants');
const { CustomError } = require('../helpers/errorHelper');
const { queryToRegExp } = require('../helpers/queryToReg');
const EventParticipation = require('../models/eventParticipation');

const Event = require('../models/event.model');
const mongoose = require('mongoose');
const { verify } = require('../helpers/tokenHelper');

exports.getAllEvents = async (req, res, next) => {
    try {
        let userId = null;
        const token = req.headers['authorization'];

        if (token) {
            try {
                const user = await verify(token); // Wait for token verification
                userId = user._id;
            } catch (err) {
                console.log('Guest exploring');
            }
        }

        const query = {};
        const sort = {};
        const filters = Object.keys(req.query);
        if (filters.includes('search')) {
            query.$or = [
                {
                    name: {
                        $regex: queryToRegExp(req.query.search),
                        $options: 'six'
                    }
                },
                {
                    details: {
                        $regex: queryToRegExp(req.query.search),
                        $options: 'six'
                    }
                }
            ];
        }
        if (filters.includes('status')) query.status = req.query.status;

        if (filters.includes('timeStatus')) {
            if (req.query.timeStatus == EVENT_TIME_STATUS.ONGOING) {
                query.from = {
                    $lte: new Date()
                };
                query.to = {
                    $gte: new Date()
                };
            }
            if (req.query.timeStatus == EVENT_TIME_STATUS.PAST) {
                query.to = {
                    $lte: new Date()
                };
            }
            if (req.query.timeStatus == EVENT_TIME_STATUS.FUTURE) {
                query.from = {
                    $gte: new Date()
                };
            }
        }
        if (filters.includes('sortBy')) {
            if (
                filters.includes('orderBy') &&
                req.query.orderBy.toLowerCase() === 'desc'
            )
                sort[req.query.sortBy] = -1;
            else sort[req.query.sortBy] = 1;
        }
        if (filters.includes('category')) {
            query['category'] = {
                $in: req.query.category.split(',').map((s) => {
                    return new mongoose.Types.ObjectId(s);
                })
            };
        }

        console.log('user', userId);

        const events = await Event.all(
            req.query.page ? req.query.page : 1,
            query,
            userId,
            sort
        );
        return res.status(200).json({
            events: events.slice(0, EVENTS_PAGINATION_LIMIT),
            hasNext: !!events[EVENTS_PAGINATION_LIMIT]
        });
    } catch (e) {
        next(e);
    }
};

exports.getEventById = async (req, res, next) => {
    try {
        const event = req.query.id
            ? await Event.findByIdAndActive(req.query.id)
            : await Event.bySlug(req.query.slug);
        if (!event) {
            throw new CustomError('Event not found');
        }
        const participant = await EventParticipation.findByEventIdWithUserDetails(
            req.query.id
        );
        return res.status(200).json({ event, participant });
    } catch (e) {
        next(e);
    }
};

exports.participateInEvent = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { eventId } = req.body;
        const event = await Event.findByIdAndActive(eventId);
        if (!event) {
            throw new CustomError('Event not found or inactive', 404);
        }

        const existingParticipation = await EventParticipation.findByEventAndUser(
            eventId,
            userId
        );
        if (existingParticipation) {
            throw new CustomError(
                'User has already participated in this event',
                400
            );
        }

        const newParticipation = await EventParticipation.createParticipation(
            eventId,
            userId
        );

        res.status(201).json({
            err: false,
            msg: 'User successfully participated in the event',
            participation: newParticipation
        });
    } catch (error) {
        next(error);
    }
};

// exports.deleteEvent = async (request, response, context) => {
//     const { record } = context;
//     await Event.removeEvent(record.params._id);

//     return {
//         notice: {
//             message: 'Successfully deleted event.',
//             type: 'success'
//         }
//     };
// };
