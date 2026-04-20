/**
 * fix-image-paths.js
 * 
 * Updates all templates in Atlas to use /images/previews/ paths
 * (served by Netlify as static files) instead of /uploads/ local paths.
 * 
 * Run: node fix-image-paths.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/template-sharing';

// Map old local paths  →  new Netlify-served paths
const PATH_MAP = {
    '/uploads/preview_pitch_deck.png': '/images/previews/preview_pitch_deck.png',
    '/uploads/preview_resume.png':     '/images/previews/preview_resume.png',
    '/uploads/preview_budget.png':     '/images/previews/preview_budget.png',
    '/uploads/preview_marketing.png':  '/images/previews/preview_marketing.png',
    '/uploads/preview_portfolio.png':  '/images/previews/preview_portfolio.png',
    '/uploads/preview_brand.png':      '/images/previews/preview_brand.png',
    '/uploads/preview_invoice.png':    '/images/previews/preview_invoice.png',
    '/uploads/preview_saas.png':       '/images/previews/preview_saas.png',
    '/uploads/preview_code_dash.png':  '/images/previews/preview_code_dash.png',
    // Also handle alternate names used in seed.js
    '/uploads/preview_brand_guidelines.png': '/images/previews/preview_brand.png',
    '/uploads/preview_saas_landing.png':     '/images/previews/preview_saas.png',
    '/uploads/preview_code_dashboard.png':   '/images/previews/preview_code_dash.png',
};

async function fixImagePaths() {
    console.log('\n🔧 Fixing template image paths...\n');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', mongoose.connection.host);

    let fixed = 0;
    let skipped = 0;

    for (const [oldPath, newPath] of Object.entries(PATH_MAP)) {
        const result = await Template.updateMany(
            { previewImage: oldPath },
            { $set: { previewImage: newPath } }
        );
        if (result.modifiedCount > 0) {
            console.log(`  ✅ ${result.modifiedCount}x ${oldPath.split('/').pop()} → ${newPath}`);
            fixed += result.modifiedCount;
        } else {
            skipped++;
        }
    }

    // Also fix any remaining /uploads/ paths not in the map
    const remaining = await Template.find({ 
        previewImage: { $regex: '^/uploads/', $options: 'i' } 
    });

    if (remaining.length > 0) {
        console.log(`\n⚠️  ${remaining.length} templates still have /uploads/ paths:`);
        remaining.forEach(t => console.log(`   - "${t.title}": ${t.previewImage}`));
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Fixed   : ${fixed} template records`);
    console.log(`⏭️  Skipped : ${skipped} (already correct or no match)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('\n🎉 Done! Push to GitHub and images will appear on Netlify.\n');

    await mongoose.disconnect();
    process.exit(0);
}

fixImagePaths().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
