// src/domain/services/UserService.js
const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const RoleRepository = require('../repositories/RoleRepository');
const GymRepository  = require('../repositories/GymRepository');

const ROLE_IDS = { ADMIN: 1, OWNER: 2, STAFF: 3 };

function isAdmin(currentUser) {
  const r = (currentUser?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

class UserService {
  static async list(params, currentUser) {
    const { includeRefs, ...listParams } = params;

    // Owner solo ve su gym
    if (!isAdmin(currentUser) && currentUser?.gym_id) {
      listParams.gymId = currentUser.gym_id;
    }

    const data = await UserRepository.findPaged(listParams);

    if (includeRefs && (isAdmin(currentUser) || currentUser?.role === 'Gym Owner')) {
      if (isAdmin(currentUser)) {
        const [roles, gyms] = await Promise.all([
          RoleRepository.findAllSimple?.() ?? [],
          GymRepository.findAllSimple?.()  ?? [],
        ]);
        return { ...data, refs: { roles, gyms } };
      } else {
        const [roles, gym] = await Promise.all([
          RoleRepository.findStaffOnlySimple?.(ROLE_IDS.STAFF) ?? [],
          GymRepository.findByIdSimple?.(currentUser.gym_id)   ?? null,
        ]);
        return { ...data, refs: { roles, gyms: gym ? [gym] : [] } };
      }
    }

    return data;
  }

  // === CREATE con respuesta sticky ===
  static async createAndReturnPage(payload, listParams, currentUser) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    if (!isAdmin(currentUser)) {
      // OWNER: forza STAFF y su gym
      payload.role_id = ROLE_IDS.STAFF;
      payload.gym_id  = currentUser.gym_id;
    } else {
      // ADMIN: valida rol si lo envía
      if (payload.role_id && !(await RoleRepository.existsById(payload.role_id))) {
        throw new Error('El rol especificado no existe');
      }
      // ADMIN: si gym_id viene y no existe, deja null para evitar FK inválida
      if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
        payload.gym_id = null;
      }
    }

    const created = await UserRepository.create(payload);

    const pageFor = await UserRepository.getPageForId(created.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: created.id };
  }

  // === UPDATE con respuesta sticky ===
  static async updateAndReturnPage(id, payload, listParams, currentUser) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const current = await UserRepository.findById(id);
    if (!current) throw new Error('Usuario no encontrado');

    if (!isAdmin(currentUser)) {
      if (currentUser?.gym_id && current.gym_id !== currentUser.gym_id) {
        throw new Error('No autorizado para modificar usuarios de otro gimnasio');
      }
      if ('role_id' in payload) delete payload.role_id;
      if ('gym_id'  in payload) delete payload.gym_id;
      payload.role_id = current.role_id;
      payload.gym_id  = current.gym_id;
    } else {
      if (payload.role_id && !(await RoleRepository.existsById(payload.role_id))) {
        throw new Error('El rol especificado no existe');
      }
      if ('gym_id' in payload) {
        if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
          payload.gym_id = current.gym_id ?? null;
        }
      }
    }

    const updated = await UserRepository.update(id, payload);

    const pageFor = await UserRepository.getPageForId(updated.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: updated.id };
  }

  // DELETE con recalculo de página
  static async removeAndReturnPage(id, listParams, currentUser) {
    if (Number(id) === Number(currentUser.id)) {
      throw new Error(isAdmin(currentUser)
        ? 'El administrador no puede eliminarse a sí mismo'
        : 'No puedes eliminar tu propio usuario');
    }

    if (!isAdmin(currentUser)) {
      const victim = await UserRepository.findById(id);
      if (!victim) throw new Error('Usuario no encontrado');
      if (currentUser?.gym_id && victim.gym_id !== currentUser.gym_id) {
        throw new Error('No autorizado para eliminar usuarios de otro gimnasio');
      }
    }

    await UserRepository.destroy(id);

    const result = await this.list(listParams, currentUser);
    const { page, totalPages } = result.meta;
    if (page > totalPages) {
      return this.list({ ...listParams, page: totalPages }, currentUser);
    }
    return result;
  }
}

module.exports = UserService;
