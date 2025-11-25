// src/app/validators/attendance.schema.js
const Joi = require('joi');

const checkInSchema = Joi.object({
  code: Joi.string().trim().max(20).required().messages({
    'any.required':  'El código es obligatorio',
    'string.empty':  'El código es obligatorio',
    'string.max':    'El código debe tener máximo 20 caracteres',
  }),

  // Admin puede mandar gym_id; Owner/Staff lo ignora el service, pero validamos tipo
  gym_id: Joi.number().integer().optional().messages({
    'number.base':   'El gimnasio debe ser un número válido',
    'number.integer':'El gimnasio debe ser un número entero',
  }),

  checked_in_at: Joi.date().optional().messages({
    'date.base':     'La fecha de registro debe ser una fecha válida',
  }),

  reason: Joi.string().trim().max(120).allow('', null).optional().messages({
    'string.max':    'La razón debe tener máximo 120 caracteres',
  }),
});

module.exports = { checkInSchema };
