// /src/app/middlewares/validateToken.js
// (reemplaza por este)
const jwt = require('../../infrastructure/auth/jwt');
const UserRepository = require('../../domain/repositories/UserRepository');

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const payload = jwt.verifyToken(token); // { id, username, ... }
    if (!payload?.id) return res.status(401).json({ error: 'Token inválido' });

    // Trae de DB para conocer role (nombre) y gym_id
    const dbUser = await UserRepository.findById(payload.id);
    if (!dbUser) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = {
      id: dbUser.id,
      role: dbUser.role?.name || dbUser.role || '', // "Administrator" / "Gym Owner" / "Staff"
      gym_id: dbUser.gym?.id ?? dbUser.gym_id ?? null,
    };

    next();
  } catch (e) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
