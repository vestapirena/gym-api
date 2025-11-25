// src/domain/services/ClientService.js

const sequelize = require('../../infrastructure/database/sequelize.config');
const ClientRepository = require('../repositories/ClientRepository');
const GymRepository    = require('../repositories/GymRepository');
const ClientSequenceRepository = require('../repositories/ClientSequenceRepository');

function isAdmin(user) {
  const r = (user?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

// Normaliza: si mandan "2" → "0002"
function normalizeCode(code) {
  const raw = String(code || '').trim();
  if (/^\d+$/.test(raw) && raw.length < 4) {
    return raw.padStart(4, '0');
  }
  return raw;
}

class ClientService {
  static async list(params, currentUser) {
    const { includeRefs, ...listParams } = params;
    if (!isAdmin(currentUser) && currentUser?.gym_id) listParams.gymId = currentUser.gym_id;

    const data = await ClientRepository.findPaged(listParams);
    if (includeRefs && isAdmin(currentUser)) {
      const gyms = await GymRepository.findAllSimple();
      return { ...data, refs: { gyms } };
    }
    return data;
  }

  // ✅ NUEVO: buscar cliente por código sin paginación
  static async getByCode(code, gymIdFromQuery, currentUser) {
    const codeNorm = normalizeCode(code);

    let targetGymId;
    if (isAdmin(currentUser)) {
      if (!gymIdFromQuery) {
        throw new Error('gym_id es obligatorio para admin al buscar por código');
      }
      targetGymId = gymIdFromQuery;
      if (!(await GymRepository.existsById(targetGymId))) {
        throw new Error('El gimnasio especificado no existe');
      }
    } else {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      targetGymId = currentUser.gym_id;
    }

    const found = await ClientRepository.findByGymAndCode(targetGymId, codeNorm);
    if (!found) throw new Error('Cliente no encontrado para ese código');
    return found;
  }

  static async createAndReturnPage(payload, listParams, currentUser) {
    let targetGymId;
    if ((currentUser?.role || '').toLowerCase().includes('admin')) {
      if (payload.gym_id == null) throw new Error('gym_id es obligatorio para crear clientes');
      if (!(await GymRepository.existsById(payload.gym_id))) throw new Error('El gimnasio especificado no existe');
      targetGymId = payload.gym_id;
    } else {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      targetGymId = currentUser.gym_id;
    }

    const created = await sequelize.transaction(async (t) => {
      payload.gym_id = targetGymId;
      const next = await ClientSequenceRepository.nextForGym(targetGymId, t);
      payload.code = String(next).padStart(4, '0');
      const row = await ClientRepository.create(payload, t);
      return row;
    });

    const pageFor = await ClientRepository.getPageForId(created.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: created.id };
  }

  static async updateAndReturnPage(id, payload, listParams, currentUser) {
    const current = await ClientRepository.findById(id);
    if (!current) throw new Error('Cliente no encontrado');

    if (!isAdmin(currentUser)) {
      if (currentUser?.gym_id && current.gym_id !== currentUser.gym_id) {
        throw new Error('No autorizado para modificar clientes de otro gimnasio');
      }
      if ('gym_id' in payload) delete payload.gym_id;
      if ('code' in payload)   delete payload.code;
      if ('email' in payload)  delete payload.email;
    } else {
      if ('code' in payload)  delete payload.code;
      if ('email' in payload) delete payload.email;
      if ('gym_id' in payload) {
        if (!(await GymRepository.existsById(payload.gym_id))) {
          payload.gym_id = current.gym_id;
        }
      }
    }

    const updated = await ClientRepository.update(id, payload);
    const pageFor = await ClientRepository.getPageForId(updated.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: updated.id };
  }

  static async removeAndReturnPage(id, listParams, currentUser) {
    const victim = await ClientRepository.findById(id);
    if (!victim) throw new Error('Cliente no encontrado');

    if (!isAdmin(currentUser) && currentUser?.gym_id && victim.gym_id !== currentUser.gym_id) {
      throw new Error('No autorizado para eliminar clientes de otro gimnasio');
    }

    await ClientRepository.destroy(id);
    const list = await this.list(listParams, currentUser);
    const { page, totalPages } = list.meta;
    if (page > totalPages) return this.list({ ...listParams, page: totalPages }, currentUser);
    return list;
  }
}

module.exports = ClientService;
