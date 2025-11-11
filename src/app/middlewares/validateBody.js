// src/app/middlewares/validateBody.js
const validateBody = (schema) => async (req, res, next) => {
  try {
    // stripUnknown: elimina campos que no estén en el esquema
    const value = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    req.body = value;
    next();
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: err.details.map(d => ({
          path: d.path.join('.'),
          message: d.message,
        })),
      });
    }
    next(err);
  }
};

module.exports = validateBody;
