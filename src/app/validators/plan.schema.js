// src/app/validators/plan.schema.js
/**
 * Validadores Joi (Planes)
 * Reglas: todos obligatorios; números > 0 (tax_rate permite 0); pesos MXN (validación numérica, no moneda).
 */
const Joi = require('joi');

const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,50}$', 'u');
const descRegex = new RegExp('^[\\p{L}\\p{M}0-9 ,.\\-]{1,100}$', 'u'); // letras con acentos, números, espacio, coma, punto y guión

const nameMx1to50 = Joi.string().trim().pattern(nameRegex).required().messages({
  'any.required':       'El nombre es obligatorio',
  'string.empty':       'El nombre es obligatorio',
  'string.pattern.base':'Nombre: letras (acentos), números y espacios (1 a 50 caracteres)',
});

const descMx1to100 = Joi.string().trim().pattern(descRegex).required().messages({
  'any.required':       'La descripción es obligatoria',
  'string.empty':       'La descripción es obligatoria',
  'string.pattern.base':'Descripción: letras (acentos), números, espacios, coma, punto y guión (1 a 100 caracteres)',
});

const positiveDec = (msg) =>
  Joi.number().greater(0).required().messages({
    'number.base':    msg,
    'number.greater': msg,
    'any.required':   msg,
  });

const nonNegativeDec = (msg) =>
  Joi.number().min(0).required().messages({
    'number.base':  msg,
    'number.min':   msg,
    'any.required': msg,
  });

const positiveInt = (msg) =>
  Joi.number().integer().greater(0).required().messages({
    'number.base':    msg,
    'number.greater': msg,
    'number.integer': msg,
    'any.required':   msg,
  });

const tinyBool = Joi.number().integer().valid(0, 1).required().messages({
  'any.only':     'display_tax_included debe ser 0 o 1',
  'number.base':  'display_tax_included debe ser 0 o 1',
  'any.required': 'display_tax_included es obligatorio',
});

const createPlanSchema = Joi.object({
  name:        nameMx1to50,
  description: descMx1to100,
  price_net:   positiveDec('price_net debe ser > 0'),
  tax_rate:    nonNegativeDec('tax_rate debe ser ≥ 0'),
  display_tax_included: tinyBool,
  // price_gross y price los ignora el backend (se calculan); si llegan, se eliminan.
  max_users:         positiveInt('max_users debe ser entero > 0'),
  max_clients:       positiveInt('max_clients debe ser entero > 0'),
  max_announcements: positiveInt('max_announcements debe ser entero > 0'),
});

const updatePlanSchema = Joi.object({
  name:        nameMx1to50.optional(),
  description: descMx1to100.optional(),
  price_net:   positiveDec('price_net debe ser > 0').optional(),
  tax_rate:    nonNegativeDec('tax_rate debe ser ≥ 0').optional(),
  display_tax_included: tinyBool.optional(),
  // price_gross / price se recalculan automáticamente
  max_users:         positiveInt('max_users debe ser entero > 0').optional(),
  max_clients:       positiveInt('max_clients debe ser entero > 0').optional(),
  max_announcements: positiveInt('max_announcements debe ser entero > 0').optional(),
})
  .min(1)
  .messages({
    'object.min': 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createPlanSchema, updatePlanSchema };
