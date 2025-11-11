// scripts/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/infrastructure/database/sequelize.config');
const User = require('../src/infrastructure/models/User');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const username = process.env.SEED_ADMIN_USER || 'admin';
    const plain = process.env.SEED_ADMIN_PASS || 'admin123';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@gym.local';

    const exists = await User.findOne({ where: { username } });
    if (exists) {
      console.log(`✔ Admin ya existe (${username})`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(plain, 10);
    const admin = await User.create({
      username,
      email,
      password: hash,
      role: 'admin',
    });

    console.log('✔ Admin creado:', {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      password: plain, // solo para pruebas iniciales
    });
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
})();
