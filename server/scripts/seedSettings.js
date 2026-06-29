const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ─── Schema (inline to avoid TS compilation) ───────────────────────────────
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', SettingSchema);

// ─── Seed data (mirrors settings.seeder.ts) ────────────────────────────────
const settingsData = [
  // Platform contact
  { key: 'supportContract', value: '+357XXXXXXXX', name: 'Support Contract' },
  { key: 'supportEmail', value: 'support@yourapp.com', name: 'Support Email' },

  // Legal content
  { key: 'tramsAndCondition', value: 'Full terms and condition content goes here...', name: 'Terms & Conditions' },
  { key: 'privacyAndPolicy', value: 'Full privacy and policy content goes here...', name: 'Privacy & Policy' }
];

// ─── Run ───────────────────────────────────────────────────────────────────
const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.DB_URL;

  if (!uri) {
    console.error('❌ MONGODB_URI or DB_URL is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // upsert: insert only if key doesn't already exist ($setOnInsert)
    const bulkOps = settingsData.map((setting) => ({
      updateOne: {
        filter: { key: setting.key },
        update: { $setOnInsert: setting },
        upsert: true,
      },
    }));

    const result = await Setting.bulkWrite(bulkOps);

    console.log(`✅ Settings seeded:`);
    console.log(`   Inserted : ${result.upsertedCount}`);
    console.log(`   Skipped  : ${result.matchedCount} (already exist)`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run();
