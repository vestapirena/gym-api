// src/app/validators/client.schema.js
const Joi = require('joi');

const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,50}$', 'u');

const firstName = Joi.string().trim().pattern(nameRegex).messages({
  'string.pattern.base':
    'El nombre solo puede contener letras (acentos), números y espacios (1 a 50 caracteres)',
  'string.empty': 'El nombre es obligatorio',
});

const lastName = Joi.string().trim().pattern(nameRegex).messages({
  'string.pattern.base':
    'El apellido solo puede contener letras (acentos), números y espacios (1 a 50 caracteres)',
  'string.empty': 'El apellido es obligatorio',
});

const phoneOptional = Joi.string()
  .pattern(/^[0-9 -]{0,20}$/)
  .allow('', null)
  .messages({
    'string.pattern.base':
      'El teléfono solo puede contener dígitos, espacios y guiones (máx. 20 caracteres)',
  });

const createClientSchema = Joi.object({
  first_name: firstName.required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre es obligatorio',
  }),
  last_name: lastName.required().messages({
    'any.required': 'El apellido es obligatorio',
    'string.empty': 'El apellido es obligatorio',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'El correo electrónico no es válido',
    'any.required': 'El correo electrónico es obligatorio',
    'string.empty': 'El correo electrónico es obligatorio',
  }),
  phone: phoneOptional,
  birthdate: Joi.date().iso().allow(null, '').messages({
    'date.base': 'La fecha de nacimiento no es válida',
  }),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .allow(null, '')
    .messages({
      'any.only': 'El género debe ser Male, Female u Other',
    }),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .default('Active')
    .messages({
      'any.only': 'El estatus debe ser Active o Inactive',
    }),
  // Para admin es opcional porque el servicio se encarga de validar/forzar gym_id
  gym_id: Joi.number().integer().optional().messages({
    'number.base': 'El gimnasio debe ser un número entero',
    'number.integer': 'El gimnasio debe ser un número entero',
  }),
});

const updateClientSchema = Joi.object({
  first_name: firstName.optional(),
  last_name: lastName.optional(),
  email: Joi.string().trim().email().optional().messages({
    'string.email': 'El correo electrónico no es válido',
  }),
  phone: phoneOptional,
  birthdate: Joi.date().iso().allow(null, ''),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow(null, ''),
  status: Joi.string().valid('Active', 'Inactive'),
  gym_id: Joi.number().integer().optional(),
})
  .min(1)
  .messages({
    'object.min': 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createClientSchema, updateClientSchema };
