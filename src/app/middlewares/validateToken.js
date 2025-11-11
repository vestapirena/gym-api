// src/app/middlewares/validateToken.js
const { verifyToken } = require('../../infrastructure/auth/jwt');

module.exports = function validateToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, username, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
