const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema(
    {
        key: { type: String },
        filePath: { type: String, default: '' }
    },
    { timestamps: true }
);

const Image = mongoose.model('Images', imageSchema);
module.exports = Image;
