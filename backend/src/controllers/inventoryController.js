const db = require('../config/db');

const LOW_STOCK_THRESHOLD = 5;

// Helper to calculate total & status for an inventory item
const formatInventoryRow = (row) => {
  const available = parseInt(row.available_units || 0);
  const reserved = parseInt(row.reserved_units || 0);
  const quarantine = parseInt(row.quarantine_units || 0);
  const total = available + reserved + quarantine;
  const status = available < LOW_STOCK_THRESHOLD ? 'LOW STOCK' : 'AVAILABLE';

  return {
    id: row.id,
    blood_group: row.blood_group,
    component_type: row.component_type,
    available_units: available,
    reserved_units: reserved,
    quarantine_units: quarantine,
    total_units: total,
    status
  };
};

// GET /api/inventory (Supports query params: bloodGroup, componentType, status)
exports.getInventory = async (req, res) => {
  try {
    const { bloodGroup, componentType, status } = req.query;

    if (db.isFallback()) {
      let items = [...db.memoryDb.bloodInventory];

      if (bloodGroup) {
        items = items.filter(i => i.blood_group.toUpperCase() === bloodGroup.toUpperCase());
      }
      if (componentType) {
        items = items.filter(i => i.component_type.toLowerCase() === componentType.toLowerCase());
      }

      let formatted = items.map(formatInventoryRow);

      if (status) {
        formatted = formatted.filter(i => i.status.toUpperCase() === status.toUpperCase());
      }

      let units = [...db.memoryDb.bloodUnits];
      if (bloodGroup) units = units.filter(u => u.blood_group.toUpperCase() === bloodGroup.toUpperCase());
      if (componentType) units = units.filter(u => u.component_type.toLowerCase() === componentType.toLowerCase());
      if (status) units = units.filter(u => u.status.toUpperCase() === status.toUpperCase());

      return res.json({
        success: true,
        inventory: formatted,
        bloodUnits: units,
        lowStockThreshold: LOW_STOCK_THRESHOLD
      });
    }

    // PostgreSQL Pathway
    let queryText = 'SELECT * FROM blood_inventory WHERE 1=1';
    const queryParams = [];

    if (bloodGroup) {
      queryParams.push(bloodGroup);
      queryText += ` AND blood_group = $${queryParams.length}`;
    }
    if (componentType) {
      queryParams.push(componentType);
      queryText += ` AND component_type = $${queryParams.length}`;
    }

    queryText += ' ORDER BY blood_group ASC, component_type ASC';
    const invRes = await db.query(queryText, queryParams);

    let formatted = invRes.rows.map(formatInventoryRow);

    if (status) {
      formatted = formatted.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }

    // Also fetch units table for itemized view
    let unitQuery = 'SELECT * FROM blood_units WHERE 1=1';
    const unitParams = [];
    if (bloodGroup) {
      unitParams.push(bloodGroup);
      unitQuery += ` AND blood_group = $${unitParams.length}`;
    }
    if (componentType) {
      unitParams.push(componentType);
      unitQuery += ` AND component_type = $${unitParams.length}`;
    }
    if (status) {
      unitParams.push(status);
      unitQuery += ` AND status = $${unitParams.length}`;
    }
    unitQuery += ' ORDER BY created_at DESC';

    const unitRes = await db.query(unitQuery, unitParams);

    res.json({
      success: true,
      inventory: formatted,
      bloodUnits: unitRes.rows,
      lowStockThreshold: LOW_STOCK_THRESHOLD
    });
  } catch (err) {
    console.error('Get Inventory Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching blood inventory' });
  }
};

// GET /api/inventory/:id
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const inv = db.memoryDb.bloodInventory.find(i => i.id === parseInt(id));
      if (inv) return res.json({ success: true, inventory: formatInventoryRow(inv) });

      const unit = db.memoryDb.bloodUnits.find(u => u.id === parseInt(id));
      if (unit) return res.json({ success: true, bloodUnit: unit });

      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const invRes = await db.query('SELECT * FROM blood_inventory WHERE id = $1', [id]);
    if (invRes.rows.length > 0) {
      return res.json({ success: true, inventory: formatInventoryRow(invRes.rows[0]) });
    }

    const unitRes = await db.query('SELECT * FROM blood_units WHERE id = $1', [id]);
    if (unitRes.rows.length > 0) {
      return res.json({ success: true, bloodUnit: unitRes.rows[0] });
    }

    res.status(404).json({ success: false, message: 'Item not found' });
  } catch (err) {
    console.error('Get Inventory ID Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching inventory record' });
  }
};

// POST /api/inventory (Add new Blood Unit)
exports.addBloodUnit = async (req, res) => {
  try {
    const { blood_group, component_type, collection_date, expiry_date, status, quantity } = req.body;

    if (!blood_group || !component_type || !collection_date || !expiry_date) {
      return res.status(400).json({ success: false, message: 'Blood group, component type, collection date, and expiry date are required.' });
    }

    const qty = parseInt(quantity || 1);
    const unitStatus = status || 'Available';

    if (db.isFallback()) {
      const unitId = db.memoryDb.nextUnitSeq++;
      const newUnit = {
        id: unitId,
        blood_group,
        component_type,
        collection_date,
        expiry_date,
        status: unitStatus,
        quantity: qty,
        created_at: new Date()
      };
      db.memoryDb.bloodUnits.unshift(newUnit);

      // Update or create aggregated inventory item
      let inv = db.memoryDb.bloodInventory.find(
        i => i.blood_group === blood_group && i.component_type === component_type
      );
      if (!inv) {
        inv = {
          id: db.memoryDb.nextInvSeq++,
          blood_group,
          component_type,
          available_units: 0,
          reserved_units: 0,
          quarantine_units: 0
        };
        db.memoryDb.bloodInventory.push(inv);
      }

      if (unitStatus === 'Available') inv.available_units += qty;
      else if (unitStatus === 'Reserved') inv.reserved_units += qty;
      else if (unitStatus === 'Quarantine') inv.quarantine_units += qty;

      return res.status(201).json({
        success: true,
        message: 'Blood unit added successfully',
        bloodUnit: newUnit,
        inventory: formatInventoryRow(inv)
      });
    }

    // PostgreSQL Pathway
    const unitRes = await db.query(
      `INSERT INTO blood_units (blood_group, component_type, collection_date, expiry_date, status, quantity)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [blood_group, component_type, collection_date, expiry_date, unitStatus, qty]
    );

    // Sync inventory aggregate table
    const invCheck = await db.query(
      'SELECT * FROM blood_inventory WHERE blood_group = $1 AND component_type = $2',
      [blood_group, component_type]
    );

    let availInc = unitStatus === 'Available' ? qty : 0;
    let resInc = unitStatus === 'Reserved' ? qty : 0;
    let quarInc = unitStatus === 'Quarantine' ? qty : 0;

    if (invCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO blood_inventory (blood_group, component_type, available_units, reserved_units, quarantine_units)
         VALUES ($1, $2, $3, $4, $5)`,
        [blood_group, component_type, availInc, resInc, quarInc]
      );
    } else {
      await db.query(
        `UPDATE blood_inventory 
         SET available_units = available_units + $1,
             reserved_units = reserved_units + $2,
             quarantine_units = quarantine_units + $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE blood_group = $4 AND component_type = $5`,
        [availInc, resInc, quarInc, blood_group, component_type]
      );
    }

    const updatedInv = await db.query(
      'SELECT * FROM blood_inventory WHERE blood_group = $1 AND component_type = $2',
      [blood_group, component_type]
    );

    res.status(201).json({
      success: true,
      message: 'Blood unit added successfully',
      bloodUnit: unitRes.rows[0],
      inventory: formatInventoryRow(updatedInv.rows[0])
    });
  } catch (err) {
    console.error('Add Blood Unit Error:', err);
    res.status(500).json({ success: false, message: 'Error adding blood unit' });
  }
};

// PUT /api/inventory/:id (Update quantities or details)
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { available_units, reserved_units, quarantine_units, status, quantity } = req.body;

    if (db.isFallback()) {
      let inv = db.memoryDb.bloodInventory.find(i => i.id === parseInt(id));
      if (inv) {
        if (available_units !== undefined) inv.available_units = Math.max(0, parseInt(available_units));
        if (reserved_units !== undefined) inv.reserved_units = Math.max(0, parseInt(reserved_units));
        if (quarantine_units !== undefined) inv.quarantine_units = Math.max(0, parseInt(quarantine_units));

        return res.json({
          success: true,
          message: 'Inventory updated successfully',
          inventory: formatInventoryRow(inv)
        });
      }

      let unit = db.memoryDb.bloodUnits.find(u => u.id === parseInt(id));
      if (unit) {
        if (status) unit.status = status;
        if (quantity !== undefined) unit.quantity = Math.max(0, parseInt(quantity));
        return res.json({ success: true, message: 'Blood unit updated successfully', bloodUnit: unit });
      }

      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }

    // PostgreSQL Pathway
    const invCheck = await db.query('SELECT * FROM blood_inventory WHERE id = $1', [id]);
    if (invCheck.rows.length > 0) {
      const updated = await db.query(
        `UPDATE blood_inventory 
         SET available_units = COALESCE($1, available_units),
             reserved_units = COALESCE($2, reserved_units),
             quarantine_units = COALESCE($3, quarantine_units),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [available_units, reserved_units, quarantine_units, id]
      );
      return res.json({
        success: true,
        message: 'Inventory updated successfully',
        inventory: formatInventoryRow(updated.rows[0])
      });
    }

    const unitCheck = await db.query('SELECT * FROM blood_units WHERE id = $1', [id]);
    if (unitCheck.rows.length > 0) {
      const updatedUnit = await db.query(
        `UPDATE blood_units 
         SET status = COALESCE($1, status),
             quantity = COALESCE($2, quantity)
         WHERE id = $3 RETURNING *`,
        [status, quantity, id]
      );
      return res.json({
        success: true,
        message: 'Blood unit updated successfully',
        bloodUnit: updatedUnit.rows[0]
      });
    }

    res.status(404).json({ success: false, message: 'Inventory record not found' });
  } catch (err) {
    console.error('Update Inventory Error:', err);
    res.status(500).json({ success: false, message: 'Error updating inventory' });
  }
};

// DELETE /api/inventory/:id (Delete Blood Unit)
exports.deleteBloodUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const unitIndex = db.memoryDb.bloodUnits.findIndex(u => u.id === parseInt(id));
      if (unitIndex !== -1) {
        const deleted = db.memoryDb.bloodUnits.splice(unitIndex, 1)[0];
        // adjust aggregate
        const inv = db.memoryDb.bloodInventory.find(
          i => i.blood_group === deleted.blood_group && i.component_type === deleted.component_type
        );
        if (inv) {
          if (deleted.status === 'Available') inv.available_units = Math.max(0, inv.available_units - deleted.quantity);
          else if (deleted.status === 'Reserved') inv.reserved_units = Math.max(0, inv.reserved_units - deleted.quantity);
          else if (deleted.status === 'Quarantine') inv.quarantine_units = Math.max(0, inv.quarantine_units - deleted.quantity);
        }
        return res.json({ success: true, message: 'Blood unit deleted successfully' });
      }

      const invIndex = db.memoryDb.bloodInventory.findIndex(i => i.id === parseInt(id));
      if (invIndex !== -1) {
        db.memoryDb.bloodInventory.splice(invIndex, 1);
        return res.json({ success: true, message: 'Inventory item deleted successfully' });
      }

      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // PostgreSQL Pathway
    const unitCheck = await db.query('SELECT * FROM blood_units WHERE id = $1', [id]);
    if (unitCheck.rows.length > 0) {
      const unit = unitCheck.rows[0];
      await db.query('DELETE FROM blood_units WHERE id = $1', [id]);

      // Adjust inventory count
      let colName = 'available_units';
      if (unit.status === 'Reserved') colName = 'reserved_units';
      else if (unit.status === 'Quarantine') colName = 'quarantine_units';

      await db.query(
        `UPDATE blood_inventory 
         SET ${colName} = GREATEST(0, ${colName} - $1), updated_at = CURRENT_TIMESTAMP
         WHERE blood_group = $2 AND component_type = $3`,
        [unit.quantity, unit.blood_group, unit.component_type]
      );

      return res.json({ success: true, message: 'Blood unit deleted successfully' });
    }

    const invCheck = await db.query('SELECT * FROM blood_inventory WHERE id = $1', [id]);
    if (invCheck.rows.length > 0) {
      await db.query('DELETE FROM blood_inventory WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Inventory record deleted successfully' });
    }

    res.status(404).json({ success: false, message: 'Item not found' });
  } catch (err) {
    console.error('Delete Inventory Error:', err);
    res.status(500).json({ success: false, message: 'Error deleting inventory item' });
  }
};
