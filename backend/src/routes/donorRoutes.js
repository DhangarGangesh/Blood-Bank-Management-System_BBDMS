const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// All donor endpoints require an authenticated session
router.use(authenticateToken);

// Staff/Admin can view the list of all registered donors
router.get('/', requireRoles('admin', 'staff'), donorController.getAllDonors);

// Donor profile & screening routes
router.get('/:id', donorController.getDonorById);
router.put('/:id', donorController.updateDonorProfile);
router.post('/:id/screening', donorController.submitHealthScreening);
router.get('/:id/screening', donorController.getHealthScreenings);

module.exports = router;
