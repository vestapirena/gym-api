// src/domain/services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('../../infrastructure/auth/jwt');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Credenciales inválidas');

    return jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role?.name || 'member',
      gym_id: user.gym_id || null,
    });
  }
}

module.exports = AuthService;
