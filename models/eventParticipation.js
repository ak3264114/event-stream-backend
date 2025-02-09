const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventParticipationSchema = new Schema(
    {
        eventId: { type: mongoose.Types.ObjectId, ref: 'Event' },
        userId: { type: mongoose.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

eventParticipationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

eventParticipationSchema.statics.findByEventAndUser = async function (
    eventId,
    userId
) {
    return this.findOne({
        eventId,
        userId
    });
};

eventParticipationSchema.statics.createParticipation = async function (
    eventId,
    userId
) {
    const newParticipation = await new this({
        eventId,
        userId
    });
    return newParticipation.save();
};

eventParticipationSchema.statics.findParticipationById = async function (id) {
    return await this.findById(id);
};

eventParticipationSchema.statics.findByQuery = async function (query) {
    return await this.find(query);
};

eventParticipationSchema.statics.findByEventIdWithUserDetails = function (
    eventId
) {
    return this.find({ eventId }).populate('userId').exec();
};
eventParticipationSchema.statics.findByUserIdWithEventDetails = function (
    userId
) {
    return this.find({ userId }).populate('eventId').exec();
};

eventParticipationSchema.statics.findParticipationByIdAndUserId = async function (
    userId,
    eventId
) {
    return await this.findOne({ userId, eventId });
};

const EventParticipation = mongoose.model(
    'EventParticipation',
    eventParticipationSchema
);
module.exports = EventParticipation;
