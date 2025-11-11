// src/app/middlewares/enforceUpdatePolicy.js
// — Reglas de actualización —
// - Nunca permitir cambiar "email": se elimina del body si viene.
// - Si "password" viene vacío ("" o null), eliminarlo para que no cambie ni valide.
//   Si viene con contenido, se mantiene (y luego Joi valida y el servicio hashea).
module.exports = () => {
  return (req, _res, next) => {
    if (!req.body || typeof req.body !== 'object') return next();

    // 1) Bloquear cambio de email
    if ('email' in req.body) {
      delete req.body.email;
    }

    // 2) Password vacío => ignorar
    if ('password' in req.body) {
      const p = req.body.password;
      if (p === '' || p === null) {
        delete req.body.password;
      }
    }

    next();
  };
};
