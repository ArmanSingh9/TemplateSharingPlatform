const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    }
}, { timestamps: true });

// Prevent multiple ratings by the same user on the same template
ratingSchema.index({ user: 1, template: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
