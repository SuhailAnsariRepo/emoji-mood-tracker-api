const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    emoji: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    updated: {
        type: Date,
        default: Date.now,
    },

});

moodSchema.pre('save', function (next) {
    this.updated = new Date();
    next();
});
module.exports = mongoose.model('mood', moodSchema);

