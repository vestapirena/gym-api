// /src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const sequelize = require('./infrastructure/database/sequelize.config');
// Registra modelos/associations una sola vez:
require('./infrastructure/models');

const authRoutes   = require('./app/routes/auth.routes');
const usersRoutes  = require('./app/routes/users.routes');
const gymRoutes    = require('./app/routes/gyms.routes');
const planRoutes   = require('./app/routes/plans.routes');
const clientRoutes = require('./app/routes/clients.routes');
const membershipRoutes = require('./app/routes/memberships.routes');
const paymentRoutes = require('./app/routes/payments.routes');
const attendanceRoutes = require('./app/routes/attendance.routes');

const validateToken = require('./app/middlewares/validateToken');
const probe         = require('./app/middlewares/reqProbe');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);              // público (login)

// 🔒 Todo lo de /api* a partir de aquí requiere token y loguea req.user
app.use('/api', validateToken, probe('AUTH'));

app.use('/api/users',  usersRoutes);
app.use('/api/gyms',   gymRoutes);
app.use('/api/plans',  planRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('DB ready');
  } catch (err) {
    console.error('Error DB:', err.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));

module.exports = app;
