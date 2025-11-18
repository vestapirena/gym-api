/**
 * Middleware: Unicidad en CREATE de CLIENTES
 * - Email único global
 * - Code único por gym (gym_id, code)
 * En UPDATE ya bloqueaste email/code con enforceClientUpdatePolicy.
 */
const ClientRepository = require('../../domain/repositories/ClientRepository');

module.exports = (mode = 'create') => async (req, res, next) => {
  try {
    if (mode !== 'create') return next(); // solo aplica en create

    const { email, gym_id, code } = req.body || {};
    const problems = [];

    if (email) {
      const existsMail = await ClientRepository.existsEmail(email);
      if (existsMail) {
        problems.push({ path: 'email', message: 'El correo ya está registrado' });
      }
    }
    if (gym_id != null && code) {
      const existsCode = await ClientRepository.existsCodeInGym(gym_id, code);
      if (existsCode) {
        problems.push({ path: 'code', message: 'El código ya existe en este gimnasio' });
      }
    }

    if (problems.length) {
      return res.status(400).json({ error: 'Validación fallida', details: problems });
    }
    next();
  } catch (err) {
    next(err);
  }
};
