const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/template-sharing';

async function checkDatabase() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to:', mongoose.connection.host);
    console.log('📦 Database name:', mongoose.connection.name);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections found: ${collections.length}`);

    if (collections.length === 0) {
      console.log('⚠️  No collections yet — database is empty (no data saved yet).');
    }

    for (const col of collections) {
      const name = col.name;
      const docs = await db.collection(name).find({}).toArray();
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📂 Collection: "${name}"  (${docs.length} document${docs.length !== 1 ? 's' : ''})`);
      console.log('='.repeat(50));
      if (docs.length === 0) {
        console.log('   (empty — no records yet)');
      } else {
        docs.forEach((doc, i) => {
          console.log(`\n  [${i + 1}]`, JSON.stringify(doc, null, 4));
        });
      }
    }

    console.log('\n✅ Database check complete!\n');
  } catch (err) {
    console.error('\n❌ Database connection failed:', err.message);
    console.error('   Make sure MongoDB service is running.\n');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDatabase();
