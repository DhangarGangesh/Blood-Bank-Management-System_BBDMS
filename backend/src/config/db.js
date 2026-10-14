const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useFallback = false;

// In-Memory Database Store (Fallback if PostgreSQL is unavailable)
const memoryDb = {
  users: [],
  donors: [],
  healthScreenings: [],
  bloodUnits: [],
  bloodInventory: [],
  nextUserSeq: 1,
  nextDonorSeq: 1,
  nextScreeningSeq: 1,
  nextUnitSeq: 1,
  nextInvSeq: 1
};

const seedData = require('./seedData');

// Seed In-Memory Store with Realistic Demo Dataset
const seedInMemoryStore = async () => {
  // Deep clone seedData to allow mutations during runtime
  memoryDb.users = JSON.parse(JSON.stringify(seedData.allUsers));
  memoryDb.nextUserSeq = memoryDb.users.length + 1;

  memoryDb.donors = JSON.parse(JSON.stringify(seedData.generatedDonors));
  memoryDb.nextDonorSeq = memoryDb.donors.length + 1;

  memoryDb.healthScreenings = JSON.parse(JSON.stringify(seedData.generatedScreenings));
  memoryDb.nextScreeningSeq = memoryDb.healthScreenings.length + 1;

  memoryDb.bloodUnits = JSON.parse(JSON.stringify(seedData.generatedBloodUnits));
  memoryDb.nextUnitSeq = memoryDb.bloodUnits.length + 1;

  memoryDb.bloodInventory = JSON.parse(JSON.stringify(seedData.generatedInventory));
  memoryDb.nextInvSeq = memoryDb.bloodInventory.length + 1;
};

// Initialize DB Connection
const initDb = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bbdms_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  try {
    pool = new Pool(dbConfig);
    // Test connection with 2 second timeout
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2500))
    ]);

    console.log('✅ Connected to PostgreSQL database successfully!');

    // Initialize Schema & Seed if tables don't exist
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    await client.query(schemaSql);
    await client.query(seedSql);
    client.release();
    console.log('✅ PostgreSQL Schema & Seed data initialized.');
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL database:', err.message);
    console.warn('⚡ Enabling In-Memory Demo Database Fallback. Complete functionality available!');
    useFallback = true;
    await seedInMemoryStore();
  }
};

module.exports = {
  initDb,
  query: async (text, params) => {
    if (!useFallback && pool) {
      return pool.query(text, params);
    }
    // Simple mock handler if fallback is active
    return { rows: [], rowCount: 0 };
  },
  isFallback: () => useFallback,
  memoryDb
};
