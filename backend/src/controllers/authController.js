const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bbdms_secret_key_2026';

// Register Donor
exports.register = async (req, res) => {
  try {
    const { name, email, phone, date_of_birth, gender, blood_group, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (db.isFallback()) {
      const existing = db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = db.memoryDb.nextUserSeq++;
      const newUser = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'donor',
        created_at: new Date()
      };
      db.memoryDb.users.push(newUser);

      const donorId = db.memoryDb.nextDonorSeq++;
      const newDonor = {
        id: donorId,
        user_id: userId,
        name,
        email,
        phone: phone || '',
        date_of_birth: date_of_birth || '',
        gender: gender || 'Other',
        blood_group: blood_group || 'O+',
        address: address || '',
        eligibility_status: 'Eligible',
        last_donation_date: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      db.memoryDb.donors.push(newDonor);

      const token = jwt.sign({ id: userId, donor_id: donorId, role: 'donor', email }, JWT_SECRET, { expiresIn: '1d' });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: { id: userId, name, email, role: 'donor' },
        donor: newDonor
      });
    }

    // PostgreSQL database pathway
    const existingRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'donor']
    );
    const user = userRes.rows[0];

    const donorRes = await db.query(
      `INSERT INTO donors (user_id, phone, date_of_birth, gender, blood_group, address, eligibility_status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Eligible') 
       RETURNING *`,
      [user.id, phone || null, date_of_birth || null, gender || null, blood_group || null, address || null]
    );
    const donor = donorRes.rows[0];

    const token = jwt.sign({ id: user.id, donor_id: donor.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user,
      donor
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (db.isFallback()) {
      const user = db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const donor = db.memoryDb.donors.find(d => d.user_id === user.id) || null;
      const token = jwt.sign({ id: user.id, donor_id: donor ? donor.id : null, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        donor
      });
    }

    // PostgreSQL Pathway
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const donorRes = await db.query('SELECT * FROM donors WHERE user_id = $1', [user.id]);
    const donor = donorRes.rows[0] || null;

    const token = jwt.sign({ id: user.id, donor_id: donor ? donor.id : null, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      donor
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};
