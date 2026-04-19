/**
 * fix-admin.js
 * One-time script to fix the admin account password.
 * Run with: node fix-admin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/template-sharing';

async function fixAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const newPassword = 'Admin@1234';
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        const result = await User.findOneAndUpdate(
            { email: 'admin@templatehub.com' },
            { 
                $set: { 
                    password: hashed,
                    role: 'admin',
                    name: 'TemplateHub Admin'
                } 
            },
            { new: true }
        );

        if (result) {
            console.log('\n✅ Admin account fixed successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email    : admin@templatehub.com');
            console.log('🔑 Password : Admin@1234');
            console.log('👑 Role     : admin');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\nGo to: http://localhost:5000/login.html');
        } else {
            // Admin doesn't exist at all — create fresh
            const adminUser = new User({
                name: 'TemplateHub Admin',
                email: 'admin@templatehub.com',
                password: hashed,
                role: 'admin'
            });
            await adminUser.save();
            console.log('\n✅ Admin account CREATED successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email    : admin@templatehub.com');
            console.log('🔑 Password : Admin@1234');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixAdmin();
