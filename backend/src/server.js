require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Blood Bank Donor Management System (BBDMS)',
    databaseMode: db.isFallback() ? 'In-Memory Fallback' : 'PostgreSQL Active',
    timestamp: new Date()
  });
});

// Start Server after Database Initialization
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BBDMS Server running on http://localhost:${PORT}`);
    console.log(`📡 Mode: ${db.isFallback() ? 'In-Memory Fallback (PostgreSQL not connected)' : 'PostgreSQL Database Connected'}`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
  app.listen(PORT, () => {
    console.log(`🚀 BBDMS Server running on http://localhost:${PORT} (Fallback Mode)`);
  });
});
