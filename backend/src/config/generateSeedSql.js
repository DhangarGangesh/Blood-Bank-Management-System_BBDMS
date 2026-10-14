const fs = require('fs');
const path = require('path');
const seedData = require('./seedData');

let sql = '-- Seed data for BBDMS PostgreSQL Database (60+ Donors, 4 Staff/Admin, 32 Inventory categories)\n';
sql += '-- Default password for demo accounts is \'password123\'\n\n';

sql += '-- 1. Insert Users\nINSERT INTO users (id, name, email, password, role) VALUES\n';
sql += seedData.allUsers.map(u => `(${u.id}, '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.password}', '${u.role}')`).join(',\n');
sql += '\nON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;\n\n';
sql += "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n\n";

sql += '-- 2. Insert Donors\nINSERT INTO donors (id, user_id, phone, date_of_birth, gender, blood_group, address, eligibility_status, last_donation_date) VALUES\n';
sql += seedData.generatedDonors.map(d => {
  const lastDon = d.last_donation_date ? `'${d.last_donation_date}'` : 'NULL';
  return `(${d.id}, ${d.user_id}, '${d.phone}', '${d.date_of_birth}', '${d.gender}', '${d.blood_group}', '${d.address.replace(/'/g, "''")}', '${d.eligibility_status}', ${lastDon})`;
}).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, address = EXCLUDED.address, eligibility_status = EXCLUDED.eligibility_status;\n\n';
sql += "SELECT setval('donors_id_seq', (SELECT MAX(id) FROM donors));\n\n";

sql += '-- 3. Insert Health Screenings\nINSERT INTO health_screenings (id, donor_id, age, weight, recent_illness, medication, recent_donation, eligible, screening_date) VALUES\n';
sql += seedData.generatedScreenings.map(sc => {
  return `(${sc.id}, ${sc.donor_id}, ${sc.age}, ${sc.weight}, '${sc.recent_illness.replace(/'/g, "''")}', '${sc.medication.replace(/'/g, "''")}', '${sc.recent_donation}', ${sc.eligible ? 'TRUE' : 'FALSE'}, '${sc.screening_date}')`;
}).join(',\n');
sql += '\nON CONFLICT (id) DO NOTHING;\n\n';
sql += "SELECT setval('health_screenings_id_seq', (SELECT MAX(id) FROM health_screenings));\n\n";

sql += '-- 4. Insert Aggregated Blood Inventory (32 categories: 8 blood groups * 4 components)\nINSERT INTO blood_inventory (blood_group, component_type, available_units, reserved_units, quarantine_units) VALUES\n';
sql += seedData.generatedInventory.map(i => {
  return `('${i.blood_group}', '${i.component_type}', ${i.available_units}, ${i.reserved_units}, ${i.quarantine_units})`;
}).join(',\n');
sql += '\nON CONFLICT (blood_group, component_type) DO UPDATE SET available_units = EXCLUDED.available_units, reserved_units = EXCLUDED.reserved_units, quarantine_units = EXCLUDED.quarantine_units;\n\n';

sql += '-- 5. Insert Itemized Blood Units\nINSERT INTO blood_units (id, blood_group, component_type, collection_date, expiry_date, status, quantity) VALUES\n';
sql += seedData.generatedBloodUnits.map(u => {
  return `(${u.id}, '${u.blood_group}', '${u.component_type}', '${u.collection_date}', '${u.expiry_date}', '${u.status}', ${u.quantity})`;
}).join(',\n');
sql += '\nON CONFLICT (id) DO NOTHING;\n\n';
sql += "SELECT setval('blood_units_id_seq', (SELECT MAX(id) FROM blood_units));\n";

fs.writeFileSync(path.join(__dirname, 'seed.sql'), sql, 'utf8');
console.log('✅ Generated comprehensive seed.sql successfully with', seedData.generatedDonors.length, 'donors and', seedData.generatedInventory.length, 'inventory categories');
