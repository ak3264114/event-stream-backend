const mongoose = require('mongoose');
const configConsts = require('../config/constants');
const Schema = mongoose.Schema;
const uniqid = require('uniqid');

const eventSchema = new Schema(
    {
        slug: { type: String, unique: true },
        name: { type: String, default: '', required: true },
        details: { type: String, default: '' },
        instruction: { type: String, default: '' },
        status: {
            type: String,
            default: configConsts.EVENT_STATUS.ACTIVE,
            enum: Object.values(configConsts.EVENT_STATUS)
        },
        avatar: { type: String, default: null },
        from: { type: Date, required: true },
        to: { type: Date, required: true }
    },
    { timestamps: true }
);

eventSchema.pre('save', function (next) {
    if (!this.isModified('name')) {
        return next();
    }
    this.slug = (this.name + uniqid('-'))
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase();
    next();
});

eventSchema.statics.all = async function (
    page = 1,
    query = {},
    userId,
    sort = { from: -1 }
) {
    const validPage = Math.max(Number(page) || 1, 1);
    const skip = (validPage - 1) * configConsts.EVENTS_PAGINATION_LIMIT;

    const filterQuery = { ...query };
    if (!filterQuery.status) {
        filterQuery.status = configConsts.EVENT_STATUS.ACTIVE;
    }

    return this.aggregate([
        { $match: filterQuery },
        { $sort: sort },
        { $skip: Math.max(skip, 0) },
        { $limit: configConsts.EVENTS_PAGINATION_LIMIT + 1 },
        {
            $lookup: {
                from: 'eventparticipations',
                localField: '_id',
                foreignField: 'eventId',
                as: 'participations',
                pipeline: [
                    {
                        $match: {
                            userId: mongoose.Types.ObjectId(userId)
                        }
                    }
                ]
            }
        },
        {
            $project: {
                slug: 1,
                name: 1,
                details: 1,
                status: 1,
                avatar: 1,
                category: 1,
                from: 1,
                to: 1,
                participated: { $gt: [{ $size: '$participations' }, 0] }
            }
        }
    ]);
};

eventSchema.statics.byId = (id) => {
    return Event.findOne({
        _id: id
    });
};

eventSchema.statics.bySlug = (slug) => {
    return Event.findOne({
        slug,
        status: configConsts.EVENT_STATUS.ACTIVE
    });
};

eventSchema.statics.removeEvent = (_id) => {
    return Event.findOneAndUpdate(
        {
            _id,
            status: configConsts.EVENT_STATUS.ACTIVE
        },
        {
            status: configConsts.EVENT_STATUS.DELETED
        }
    );
};

eventSchema.statics.findByIdAndActive = async function (id, projection) {
    return this.findOne(
        {
            _id: id,
            status: configConsts.EVENT_STATUS.ACTIVE
        },
        projection
    );
};
eventSchema.statics.updateById = async function (id, data, projection) {
    return this.findByIdAndUpdate(id, data, {
        new: true,
        upsert: true,
        projection
    });
};
eventSchema.statics.createEvent = async function (data) {
    const newEvent = new this(data);
    return await newEvent.save();
};
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
