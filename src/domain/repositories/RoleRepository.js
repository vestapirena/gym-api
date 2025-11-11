// src/domain/repositories/RoleRepository.js
const Role = require('../../infrastructure/models/Role');

class RoleRepository {
  static async findAllSimple() {
    return Role.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
  }

  static async findStaffOnlySimple(staffRoleId = 3) {
    return Role.findAll({
      attributes: ['id', 'name'],
      where: { id: staffRoleId },
      order: [['name', 'ASC']],
    });
  }

  static async existsById(id) {
    if (id == null) return false;
    const found = await Role.findByPk(id, { attributes: ['id'] });
    return !!found;
  }
}

module.exports = RoleRepository;
