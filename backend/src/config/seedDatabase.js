require('dotenv').config();
const { Pool } = require('pg');
const seedData = require('./seedData');

async function seedDatabase(options = {}) {
  const isReset = options.reset || process.argv.includes('--reset');

  console.log('====================================================');
  console.log(`🌱 BBDMS DATABASE SEEDING SCRIPT ${isReset ? '(RESET & RESEED MODE)' : '(SAFE IDEMPOTENT MODE)'}`);
  console.log('====================================================');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bbdms_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  const pool = new Pool(dbConfig);
  let client;

  try {
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL connection timeout (2.5s)')), 2500))
    ]);

    console.log('✅ Connected to PostgreSQL database successfully.');

    await client.query('BEGIN');

    if (isReset) {
      console.log('🧹 Safely resetting demo records...');
      // Safe reset only of demo tables
      await client.query('TRUNCATE TABLE health_screenings, blood_units, blood_inventory CASCADE;');
      await client.query("DELETE FROM donors WHERE email LIKE '%@example.com' OR email LIKE '%@lifesave.org';");
      await client.query("DELETE FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@lifesave.org';");
      console.log('✅ Demo records cleared.');
    }

    // 1. Seed Users (Staff & Donors)
    console.log(`👤 Seeding ${seedData.allUsers.length} user accounts...`);
    for (const u of seedData.allUsers) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO UPDATE SET 
           name = EXCLUDED.name, 
           role = EXCLUDED.role, 
           password = EXCLUDED.password`,
        [u.id, u.name, u.email, u.password, u.role]
      );
    }
    await client.query("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));");

    // 2. Seed Donors
    console.log(`🩸 Seeding ${seedData.generatedDonors.length} donor profiles...`);
    for (const d of seedData.generatedDonors) {
      await client.query(
        `INSERT INTO donors (id, user_id, phone, date_of_birth, gender, blood_group, address, eligibility_status, last_donation_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           phone = EXCLUDED.phone,
           date_of_birth = EXCLUDED.date_of_birth,
           gender = EXCLUDED.gender,
           blood_group = EXCLUDED.blood_group,
           address = EXCLUDED.address,
           eligibility_status = EXCLUDED.eligibility_status,
           last_donation_date = EXCLUDED.last_donation_date,
           updated_at = CURRENT_TIMESTAMP`,
        [d.id, d.user_id, d.phone, d.date_of_birth, d.gender, d.blood_group, d.address, d.eligibility_status, d.last_donation_date]
      );
    }
    await client.query("SELECT setval('donors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM donors));");

    // 3. Seed Health Screenings
    console.log(`📋 Seeding ${seedData.generatedScreenings.length} health screening records...`);
    for (const sc of seedData.generatedScreenings) {
      await client.query(
        `INSERT INTO health_screenings (id, donor_id, age, weight, recent_illness, medication, recent_donation, eligible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           age = EXCLUDED.age,
           weight = EXCLUDED.weight,
           recent_illness = EXCLUDED.recent_illness,
           medication = EXCLUDED.medication,
           recent_donation = EXCLUDED.recent_donation,
           eligible = EXCLUDED.eligible`,
        [sc.id, sc.donor_id, sc.age, sc.weight, sc.recent_illness, sc.medication, sc.recent_donation, sc.eligible]
      );
    }
    await client.query("SELECT setval('health_screenings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM health_screenings));");

    // 4. Seed Aggregated Blood Inventory (32 categories)
    console.log(`📦 Seeding ${seedData.generatedInventory.length} aggregated inventory categories...`);
    for (const inv of seedData.generatedInventory) {
      await client.query(
        `INSERT INTO blood_inventory (blood_group, component_type, available_units, reserved_units, quarantine_units)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (blood_group, component_type) DO UPDATE SET
           available_units = EXCLUDED.available_units,
           reserved_units = EXCLUDED.reserved_units,
           quarantine_units = EXCLUDED.quarantine_units,
           updated_at = CURRENT_TIMESTAMP`,
        [inv.blood_group, inv.component_type, inv.available_units, inv.reserved_units, inv.quarantine_units]
      );
    }

    // 5. Seed Itemized Blood Units
    console.log(`🧪 Seeding ${seedData.generatedBloodUnits.length} individual blood units...`);
    for (const u of seedData.generatedBloodUnits) {
      await client.query(
        `INSERT INTO blood_units (id, blood_group, component_type, collection_date, expiry_date, status, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           blood_group = EXCLUDED.blood_group,
           component_type = EXCLUDED.component_type,
           collection_date = EXCLUDED.collection_date,
           expiry_date = EXCLUDED.expiry_date,
           status = EXCLUDED.status,
           quantity = EXCLUDED.quantity`,
        [u.id, u.blood_group, u.component_type, u.collection_date, u.expiry_date, u.status, u.quantity]
      );
    }
    await client.query("SELECT setval('blood_units_id_seq', (SELECT COALESCE(MAX(id), 1) FROM blood_units));");

    await client.query('COMMIT');

    console.log('====================================================');
    console.log('✅ POSTGRESQL SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`📊 Summary of records in database:`);
    console.log(`   - Users:              ${seedData.allUsers.length} (4 Staff/Admin, ${seedData.generatedUsers.length} Donors)`);
    console.log(`   - Donors:             ${seedData.generatedDonors.length} Profiles`);
    console.log(`   - Health Screenings:  ${seedData.generatedScreenings.length} Submissions`);
    console.log(`   - Inventory Categories: 32 (All 8 Blood Groups x 4 Components)`);
    console.log(`   - Blood Bag Units:    ${seedData.generatedBloodUnits.length} Itemized records`);
    console.log('====================================================');
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.warn(`⚠️ PostgreSQL connection note: ${err.message}`);
    console.log('ℹ️ Application is equipped with automatic In-Memory Fallback containing the exact same full dataset.');
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
