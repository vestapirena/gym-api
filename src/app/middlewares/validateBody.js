// src/app/middlewares/validateBody.js
const validateBody = (schema) => async (req, res, next) => {
  try {
    if (!schema || typeof schema.validateAsync !== 'function') {
      throw new Error('Schema inválido en validateBody (no tiene validateAsync)');
    }

    const value = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    req.body = value;
    next();
  } catch (err) {
    if (err.isJoi) {
      const details = err.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message,
      }));
      const first = details[0];

      return res.status(400).json({
        error: 'Validación fallida',
        message: first?.message || 'Ocurrió un error de validación',
        field: first?.path || null,
        details,
      });
    }
    next(err);
  }
};

module.exports = validateBody;
