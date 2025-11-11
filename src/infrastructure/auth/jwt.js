// src/infrastructure/auth/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'claveultrasecreta';

const generateToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '8h' });
const verifyToken = (token) => jwt.verify(token, SECRET);

module.exports = { generateToken, verifyToken };
