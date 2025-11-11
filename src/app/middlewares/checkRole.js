// src/app/middlewares/checkRole.js
module.exports = function checkRole(...allowed) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(403).json({ error: 'Sin rol' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
};
