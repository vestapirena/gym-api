// src/domain/services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('../../infrastructure/auth/jwt');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
  static async login(email, password) {
    // 1) Buscar usuario por email
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    // 2) Validar password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Credenciales inválidas');

    // 3) Armar payload para el JWT (igual que antes, pero usando role/gym)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role?.name || user.role || 'member',
      gym_id: user.gym?.id ?? user.gym_id ?? null,
    };

    const token = jwt.generateToken(payload);

    // 4) Armar objeto user "seguro" para el frontend (como /me)
    const safeUser = {
      id: payload.id,
      role: payload.role,
      gym_id: payload.gym_id,
    };

    // 5) Regresar ambos
    return { token, user: safeUser };
  }
}

module.exports = AuthService;
