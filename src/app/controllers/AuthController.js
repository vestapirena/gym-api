// src/app/controllers/AuthController.js
const AuthService = require('../../domain/services/AuthService');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'email y password son requeridos' });
      }

      // Ahora esperamos { token, user }
      const { token, user } = await AuthService.login(email, password);

      return res.json({
        token,
        user, // { id, role, gym_id }
      });
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  }
}

module.exports = AuthController;
