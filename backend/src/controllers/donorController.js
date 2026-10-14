const db = require('../config/db');

// Get Donor Profile by ID
exports.getDonorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const donor = db.memoryDb.donors.find(d => d.id === parseInt(id) || d.user_id === parseInt(id));
      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const user = db.memoryDb.users.find(u => u.id === donor.user_id) || {};
      const screenings = db.memoryDb.healthScreenings.filter(s => s.donor_id === donor.id);

      return res.json({
        success: true,
        donor: {
          ...donor,
          name: donor.name || user.name,
          email: donor.email || user.email,
          screenings
        }
      });
    }

    // PostgreSQL pathway
    const donorQuery = `
      SELECT d.*, u.name, u.email 
      FROM donors d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = $1 OR d.user_id = $1
    `;
    const donorRes = await db.query(donorQuery, [id]);

    if (donorRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile not found' });
    }

    const donor = donorRes.rows[0];
    const screeningRes = await db.query('SELECT * FROM health_screenings WHERE donor_id = $1 ORDER BY screening_date DESC', [donor.id]);

    res.json({
      success: true,
      donor: {
        ...donor,
        screenings: screeningRes.rows
      }
    });
  } catch (err) {
    console.error('Get Donor Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching donor profile' });
  }
};

// Update Donor Profile
exports.updateDonorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, date_of_birth, gender, blood_group, address, name } = req.body;

    if (db.isFallback()) {
      const donorIndex = db.memoryDb.donors.findIndex(d => d.id === parseInt(id) || d.user_id === parseInt(id));
      if (donorIndex === -1) {
        return res.status(404).json({ success: false, message: 'Donor not found' });
      }

      const donor = db.memoryDb.donors[donorIndex];
      if (name) {
        donor.name = name;
        const user = db.memoryDb.users.find(u => u.id === donor.user_id);
        if (user) user.name = name;
      }
      if (phone !== undefined) donor.phone = phone;
      if (date_of_birth !== undefined) donor.date_of_birth = date_of_birth;
      if (gender !== undefined) donor.gender = gender;
      if (blood_group !== undefined) donor.blood_group = blood_group;
      if (address !== undefined) donor.address = address;
      donor.updated_at = new Date();

      return res.json({ success: true, message: 'Profile updated successfully', donor });
    }

    // PostgreSQL pathway
    const donorRes = await db.query('SELECT * FROM donors WHERE id = $1 OR user_id = $1', [id]);
    if (donorRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const targetDonor = donorRes.rows[0];

    if (name) {
      await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, targetDonor.user_id]);
    }

    const updateQuery = `
      UPDATE donors 
      SET phone = COALESCE($1, phone),
          date_of_birth = COALESCE($2, date_of_birth),
          gender = COALESCE($3, gender),
          blood_group = COALESCE($4, blood_group),
          address = COALESCE($5, address),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const updatedRes = await db.query(updateQuery, [
      phone || null,
      date_of_birth || null,
      gender || null,
      blood_group || null,
      address || null,
      targetDonor.id
    ]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      donor: updatedRes.rows[0]
    });
  } catch (err) {
    console.error('Update Donor Error:', err);
    res.status(500).json({ success: false, message: 'Error updating donor profile' });
  }
};

// Submit Health Screening / Basic Eligibility Form
exports.submitHealthScreening = async (req, res) => {
  try {
    const { id } = req.params; // donor_id or user_id
    const { age, weight, recent_illness, medication, recent_donation } = req.body;

    const numAge = parseInt(age);
    const numWeight = parseFloat(weight);

    // Academic Demo Simple Eligibility Rules
    // Eligible if: Age 18-65, Weight >= 50kg, no illness reported, no medication reported
    const hasIllness = recent_illness && recent_illness.trim().toLowerCase() !== 'none' && recent_illness.trim().toLowerCase() !== 'no' && recent_illness !== false;
    const hasMedication = medication && medication.trim().toLowerCase() !== 'none' && medication.trim().toLowerCase() !== 'no' && medication !== false;
    
    const isEligible = Boolean(
      numAge >= 18 && 
      numAge <= 65 && 
      numWeight >= 50 && 
      !hasIllness && 
      !hasMedication
    );

    const eligibilityStatus = isEligible ? 'Eligible' : 'Not Eligible';

    if (db.isFallback()) {
      const donor = db.memoryDb.donors.find(d => d.id === parseInt(id) || d.user_id === parseInt(id));
      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor not found' });
      }

      donor.eligibility_status = eligibilityStatus;
      const screeningId = db.memoryDb.nextScreeningSeq++;
      const newScreening = {
        id: screeningId,
        donor_id: donor.id,
        age: numAge,
        weight: numWeight,
        recent_illness: recent_illness || 'None',
        medication: medication || 'None',
        recent_donation: recent_donation || 'None',
        eligible: isEligible,
        screening_date: new Date().toISOString()
      };
      db.memoryDb.healthScreenings.push(newScreening);

      return res.json({
        success: true,
        message: 'Health screening submitted successfully',
        eligible: isEligible,
        eligibilityStatus,
        screening: newScreening
      });
    }

    // PostgreSQL pathway
    const donorRes = await db.query('SELECT id FROM donors WHERE id = $1 OR user_id = $1', [id]);
    if (donorRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    const donorId = donorRes.rows[0].id;

    await db.query('UPDATE donors SET eligibility_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [eligibilityStatus, donorId]);

    const screeningRes = await db.query(
      `INSERT INTO health_screenings (donor_id, age, weight, recent_illness, medication, recent_donation, eligible)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [donorId, numAge, numWeight, recent_illness || 'None', medication || 'None', recent_donation || 'None', isEligible]
    );

    res.json({
      success: true,
      message: 'Health screening submitted successfully',
      eligible: isEligible,
      eligibilityStatus,
      screening: screeningRes.rows[0]
    });
  } catch (err) {
    console.error('Health Screening Error:', err);
    res.status(500).json({ success: false, message: 'Error submitting health screening' });
  }
};

// Get Donor Health Screenings
exports.getHealthScreenings = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const donor = db.memoryDb.donors.find(d => d.id === parseInt(id) || d.user_id === parseInt(id));
      if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
      const screenings = db.memoryDb.healthScreenings.filter(s => s.donor_id === donor.id);
      return res.json({ success: true, screenings });
    }

    const donorRes = await db.query('SELECT id FROM donors WHERE id = $1 OR user_id = $1', [id]);
    if (donorRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Donor not found' });
    const donorId = donorRes.rows[0].id;

    const screeningsRes = await db.query('SELECT * FROM health_screenings WHERE donor_id = $1 ORDER BY screening_date DESC', [donorId]);
    res.json({ success: true, screenings: screeningsRes.rows });
  } catch (err) {
    console.error('Get Health Screenings Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching health screenings' });
  }
};

// Get All Donors (Staff / Admin directory)
exports.getAllDonors = async (req, res) => {
  try {
    if (db.isFallback()) {
      const donors = db.memoryDb.donors.map(d => {
        const user = db.memoryDb.users.find(u => u.id === d.user_id) || {};
        return {
          ...d,
          name: d.name || user.name,
          email: d.email || user.email
        };
      });
      return res.json({ success: true, donors });
    }

    const query = `
      SELECT d.*, u.name, u.email 
      FROM donors d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.id ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, donors: result.rows });
  } catch (err) {
    console.error('Get All Donors Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching donors list' });
  }
};

