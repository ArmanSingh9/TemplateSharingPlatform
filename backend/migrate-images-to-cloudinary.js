/**
 * migrate-images-to-cloudinary.js
 * 
 * One-time script: uploads all local /uploads/*.png preview images
 * to Cloudinary and updates the database records with the new cloud URLs.
 * 
 * Run AFTER setting CLOUDINARY_* env vars:
 *   node migrate-images-to-cloudinary.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

const Template = require('./models/Template');

// ── Check credentials ─────────────────────────────────
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('\n❌ Missing Cloudinary credentials in .env!\n');
    console.log('Add these to your backend/.env file:');
    console.log('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('  CLOUDINARY_API_KEY=your_api_key');
    console.log('  CLOUDINARY_API_SECRET=your_api_secret\n');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/template-sharing';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function migrateImages() {
    console.log('\n🚀 Starting Cloudinary image migration...\n');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all templates with local preview images (not already a Cloudinary URL)
    const templates = await Template.find({
        previewImage: { $exists: true, $ne: null, $not: /^https/ }
    });

    console.log(`📸 Found ${templates.length} templates with local preview images\n`);

    let success = 0;
    let failed = 0;

    for (const template of templates) {
        const localRelPath = template.previewImage; // e.g. /uploads/preview_pitch_deck.png
        const filename = path.basename(localRelPath);
        const localFilePath = path.join(UPLOADS_DIR, filename);

        process.stdout.write(`  ⬆️  Uploading "${filename}"... `);

        if (!fs.existsSync(localFilePath)) {
            console.log(`❌ File not found locally — skipping`);
            failed++;
            continue;
        }

        try {
            const result = await cloudinary.uploader.upload(localFilePath, {
                folder: 'templatehub/previews',
                public_id: filename.replace(/\.[^/.]+$/, ''), // strip extension
                overwrite: true,
                transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
            });

            // Update the database record
            await Template.findByIdAndUpdate(template._id, {
                previewImage: result.secure_url
            });

            console.log(`✅ Done → ${result.secure_url.substring(0, 60)}...`);
            success++;
        } catch (err) {
            console.log(`❌ Upload failed: ${err.message}`);
            failed++;
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully migrated : ${success} images`);
    console.log(`❌ Failed / skipped      : ${failed} images`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Migration complete! Your deployed site will now show images.\n');

    await mongoose.disconnect();
}

migrateImages().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
