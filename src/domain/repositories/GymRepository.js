// src/domain/repositories/GymRepository.js
const Gym = require('../../infrastructure/models/Gym');

class GymRepository {
  static async findAllSimple() {
    return Gym.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
  }

  static async findByIdSimple(id) {
    if (id == null) return null;
    return Gym.findOne({ attributes: ['id', 'name'], where: { id } });
  }

  static async existsById(id) {
    if (id == null) return false;
    const found = await Gym.findByPk(id, { attributes: ['id'] });
    return !!found;
  }
}

module.exports = GymRepository;
