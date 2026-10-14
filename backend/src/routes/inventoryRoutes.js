const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Module 2: Blood Inventory Management - Restricted to Staff & Admin only
router.use(authenticateToken);
router.use(requireRoles('admin', 'staff'));

router.get('/', inventoryController.getInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.addBloodUnit);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteBloodUnit);

module.exports = router;
