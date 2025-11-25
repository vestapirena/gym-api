// src/app/validators/payment.schema.js
/**
 * Joi: Payments (wizard)
 * - una fecha deseada opcional (start_date)
 * - o start_date por cliente si el FE lo manda así
 */
const Joi = require('joi');

const codeMx = Joi.string().trim().min(1).max(20).required().messages({
  'any.required':  'El código del cliente es obligatorio',
  'string.empty':  'El código del cliente es obligatorio',
  'string.min':    'El código del cliente es obligatorio',
  'string.max':    'El código del cliente debe tener máximo 20 caracteres',
});

const clientShape = Joi.object({
  code: codeMx,
  start_date: Joi.date().iso().optional().messages({
    'date.base':   'La fecha de inicio del cliente debe ser una fecha válida',
    'date.format': 'La fecha de inicio del cliente debe tener formato ISO (AAAA-MM-DD)',
  }),
});

const createPaymentSchema = Joi.object({
  membership_id: Joi.number().integer().required().messages({
    'any.required':   'La membresía es obligatoria',
    'number.base':    'La membresía debe ser un número válido',
    'number.integer': 'La membresía debe ser un número válido',
  }),

  // fecha deseada global (una sola fecha del wizard)
  start_date: Joi.date().iso().optional().messages({
    'date.base':   'La fecha de inicio debe ser una fecha válida',
    'date.format': 'La fecha de inicio debe tener formato ISO (AAAA-MM-DD)',
  }),

  clients: Joi.array().items(clientShape).min(1).required().messages({
    'array.min':     'Debes enviar al menos un cliente',
    'any.required':  'Debes enviar al menos un cliente',
  }),

  payment_method: Joi.string()
    .valid('Cash', 'Card', 'Transfer', 'Other')
    .required()
    .messages({
      'any.only':     'El método de pago es inválido',
      'any.required': 'El método de pago es obligatorio',
      'string.empty': 'El método de pago es obligatorio',
    }),
});

module.exports = { createPaymentSchema };
