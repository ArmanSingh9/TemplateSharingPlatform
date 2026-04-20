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
// NOTE: In Mongoose 6+, async pre-save hooks must NOT use next() — 
// Mongoose resolves the hook via the returned Promise automatically.
userSchema.pre('save', async function () {
    // Skip if password field was not changed
    if (!this.isModified('password')) return;
    // Skip if already a valid bcrypt hash (starts with $2b$ or $2a$)
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) return;
    // Hash the plain-text password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
