// src/app/middlewares/ensureUniqueEmail.js
const UserRepository = require('../../domain/repositories/UserRepository');

/**
 * Valida unicidad de email al mismo nivel que Joi.
 * mode: 'create' | 'update'
 */
module.exports = (mode = 'create') => {
  return async (req, res, next) => {
    try {
      const email = req.body?.email;
      if (!email) return next(); // Si no hay email en el body, no valida

      let exists = false;
      if (mode === 'create') {
        exists = await UserRepository.existsEmail(email);
      } else {
        const id = Number(req.params.id);
        exists = await UserRepository.existsEmailExcludingId(email, id);
      }

      if (exists) {
        return res.status(400).json({
          error: 'Validación fallida',
          details: [{ path: 'email', message: 'El correo ya existe' }],
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
