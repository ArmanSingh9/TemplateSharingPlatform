const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Auto-hash password before saving (only if changed)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    // Only hash if it's not already a bcrypt hash
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
