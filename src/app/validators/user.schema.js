// src/app/validators/user.schema.js
const Joi = require('joi');

// ✅ Nombres/apellidos: letras (incluye acentos y ñ), números y espacios, 1–30.
//    - Usamos propiedades Unicode: \p{L} (letras), \p{M} (marcas de acento)
//    - Flag "u" para habilitar propiedades Unicode en JS RegExp
const nameRegex = new RegExp('^[\\p{L}\\p{M}0-9 ]{1,30}$', 'u');

const nameMx1to30 = Joi.string()
  .trim()
  .pattern(nameRegex)
  .messages({
    'string.pattern.base': 'Debe contener letras (acentos), números y espacios (1 a 30 caracteres)',
    'string.empty': 'Campo obligatorio',
  });

// Teléfono opcional: dígitos, espacios y guiones, máx 20
const phoneOptional = Joi.string()
  .pattern(/^[0-9 -]{0,20}$/)
  .allow('', null)
  .messages({
    'string.pattern.base': 'Teléfono: solo dígitos, espacios y guiones, máx 20',
  });

// Password: 8–16, al menos 1 letra y 1 número, símbolos permitidos
const passwordStrict = Joi.string()
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]{8,16}$/)
  .messages({
    'string.pattern.base':
      'Contraseña: 8-16 caracteres, mínimo una letra y un número (se permiten símbolos comunes)',
    'string.empty': 'Contraseña obligatoria',
  });

// Email formato
const emailStrict = Joi.string().email().messages({
  'string.email': 'Correo inválido',
  'string.empty': 'Correo obligatorio',
});

// Crear: nombre, apellido, email, password son obligatorios
const createUserSchema = Joi.object({
  first_name: nameMx1to30.required().messages({
    'any.required': 'El nombre es obligatorio',
  }),
  last_name: nameMx1to30.required().messages({
    'any.required': 'El apellido es obligatorio',
  }),
  email: emailStrict.required().messages({
    'any.required': 'El correo es obligatorio',
  }),
  password: passwordStrict.required(),
  phone: phoneOptional,
  role_id: Joi.number().integer().optional(),
  gym_id: Joi.number().integer().allow(null).optional(),
});

// Actualizar: parcial; si se envía un campo, se valida.
// (OJO: tu middleware enforceUpdatePolicy ya impide cambiar email y quita password vacía)
const updateUserSchema = Joi.object({
  first_name: nameMx1to30.optional(),
  last_name: nameMx1to30.optional(),
  email: emailStrict.optional(),        // será removido por enforceUpdatePolicy, pero lo dejamos por compatibilidad
  password: passwordStrict.optional(),  // si viene, se valida; si viene vacío, tu middleware lo quita
  phone: phoneOptional,
  role_id: Joi.number().integer().optional(),
  gym_id: Joi.number().integer().allow(null).optional(),
})
.min(1)
.messages({
  'object.min': 'Debes enviar al menos un campo para actualizar',
});

module.exports = { createUserSchema, updateUserSchema };
