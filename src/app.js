// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const sequelize = require('./infrastructure/database/sequelize.config');

// ⚠️ REGISTRA MODELOS UNA SOLA VEZ
require('./infrastructure/models/Role');
require('./infrastructure/models/Gym');
require('./infrastructure/models/User');

// Rutas
const authRoutes = require('./app/routes/auth.routes');      // ya la tenías
const usersRoutes = require('./app/routes/users.routes');     // nombre distinto para evitar choque

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Prefijos
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// DB bootstrap
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // crea tablas si no existen
    console.log('DB ready');
  } catch (err) {
    console.error('Error DB:', err.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));

module.exports = app;
