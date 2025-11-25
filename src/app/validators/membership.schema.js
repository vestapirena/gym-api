// src/app/validators/membership.schema.js
const Joi = require('joi');

const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,100}$', 'u');
const descRegex = new RegExp('^[\\p{L}\\p{M}0-9 ,.\\-]{1,255}$', 'u');

const nameMx = Joi.string().trim().pattern(nameRegex).required().messages({
  'string.pattern.base': 'El nombre solo puede contener letras (acentos), números y espacios (1 a 100 caracteres)',
  'string.empty':        'El nombre es obligatorio',
  'any.required':        'El nombre es obligatorio',
});

const descMx = Joi.string().trim().pattern(descRegex).required().messages({
  'string.pattern.base': 'La descripción solo puede contener letras (acentos), números, coma, punto y guión (1 a 255 caracteres)',
  'string.empty':        'La descripción es obligatoria',
  'any.required':        'La descripción es obligatoria',
});

const moneyPos = (msg) =>
  Joi.number().greater(0).required().messages({
    'number.base':    msg,
    'number.greater': msg,
    'any.required':   msg,
  });

const rateNN = (msg) =>
  Joi.number().min(0).required().messages({
    'number.base':  msg,
    'number.min':   msg,
    'any.required': msg,
  });

const baseShape = {
  name:        nameMx,
  description: descMx,

  period_unit: Joi.string()
    .valid('day', 'month', 'year')
    .required()
    .messages({
      'any.only':     'La unidad de periodo es inválida (usa day, month o year)',
      'any.required': 'La unidad de periodo es obligatoria',
    }),

  period_value: Joi.number().integer().greater(0).required().messages({
    'number.base':    'El valor del periodo debe ser un número entero mayor a 0',
    'number.integer': 'El valor del periodo debe ser un número entero mayor a 0',
    'number.greater': 'El valor del periodo debe ser un número entero mayor a 0',
    'any.required':   'El valor del periodo es obligatorio',
  }),

  price_net: moneyPos('El precio neto debe ser mayor a 0'),

  tax_rate: rateNN('La tasa de impuesto debe ser mayor o igual a 0'),

  display_tax_included: Joi.number().integer().valid(0, 1).required().messages({
    'any.only':     'El campo display_tax_included debe ser 0 o 1',
    'number.base':  'El campo display_tax_included debe ser 0 o 1',
    'any.required': 'El campo display_tax_included es obligatorio',
  }),

  status: Joi.string()
    .valid('Active', 'Inactive')
    .required()
    .messages({
      'any.only':     'El estatus es inválido',
      'any.required': 'El estatus es obligatorio',
      'string.empty': 'El estatus es obligatorio',
    }),
};

const createMembershipSchema = Joi.object({
  // 👇 Ya NO required; solo validamos tipo si viene
  gym_id: Joi.number().integer().optional().allow(null).messages({
    'number.base':    'El gimnasio debe ser un número válido',
    'number.integer': 'El gimnasio debe ser un número válido',
  }),
  ...baseShape,
});


const updateMembershipSchema = Joi.object({
  // Admin puede mover de gym; Owner no (se controla en servicio)
  gym_id: Joi.number().integer().optional().messages({
    'number.base':    'El gimnasio debe ser un número válido',
    'number.integer': 'El gimnasio debe ser un número válido',
  }),
  name: Joi.string().trim().pattern(nameRegex).optional().messages({
    'string.pattern.base': 'El nombre solo puede contener letras (acentos), números y espacios (1 a 100 caracteres)',
  }),
  description: Joi.string().trim().pattern(descRegex).optional().messages({
    'string.pattern.base': 'La descripción solo puede contener letras (acentos), números, coma, punto y guión (1 a 255 caracteres)',
  }),
  period_unit: Joi.string().valid('day', 'month', 'year').optional().messages({
    'any.only': 'La unidad de periodo es inválida (usa day, month o year)',
  }),
  period_value: Joi.number().integer().greater(0).optional().messages({
    'number.base':    'El valor del periodo debe ser un número entero mayor a 0',
    'number.integer': 'El valor del periodo debe ser un número entero mayor a 0',
    'number.greater': 'El valor del periodo debe ser un número entero mayor a 0',
  }),
  price_net: Joi.number().greater(0).optional().messages({
    'number.base':    'El precio neto debe ser un número mayor a 0',
    'number.greater': 'El precio neto debe ser mayor a 0',
  }),
  tax_rate: Joi.number().min(0).optional().messages({
    'number.base': 'La tasa de impuesto debe ser un número',
    'number.min':  'La tasa de impuesto debe ser mayor o igual a 0',
  }),
  display_tax_included: Joi.number().integer().valid(0, 1).optional().messages({
    'any.only':    'El campo display_tax_included debe ser 0 o 1',
    'number.base': 'El campo display_tax_included debe ser 0 o 1',
  }),
  status: Joi.string().valid('Active', 'Inactive').optional().messages({
    'any.only': 'El estatus es inválido',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createMembershipSchema, updateMembershipSchema };
