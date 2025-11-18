/**
 * Middleware: política de update para USERS
 * - El correo JAMÁS se puede cambiar.
 * - Si password viene vacío ('' o null), se elimina para que no aplique reglas.
 */
module.exports = () => (req, _res, next) => {
  // blindar email
  if ('email' in req.body) delete req.body.email;

  // si password viene vacío, quitarlo
  if ('password' in req.body) {
    const v = req.body.password;
    if (v === '' || v === null || typeof v === 'undefined') {
      delete req.body.password;
    }
  }
  next();
};
