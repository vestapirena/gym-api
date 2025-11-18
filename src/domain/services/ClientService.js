// /src/domain/services/ClientService.js
/**
 * Servicio: Clientes
 * - Admin: CRUD todos los gyms (gym_id requerido y validado).
 * - Owner: CRUD solo su gym (gym_id forzado).
 * - Respuestas sticky en create/update.
 */
const ClientRepository = require('../repositories/ClientRepository');
const GymRepository    = require('../repositories/GymRepository');

function isAdmin(user) {
  const r = (user?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
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

  static async createAndReturnPage(payload, listParams, currentUser) {
    // gym objetivo
    let targetGymId;
    if (!isAdmin(currentUser)) {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      targetGymId = currentUser.gym_id;
    } else {
      if (payload.gym_id == null) throw new Error('gym_id es obligatorio para crear clientes');
      if (!(await GymRepository.existsById(payload.gym_id))) throw new Error('El gimnasio especificado no existe');
      targetGymId = payload.gym_id;
    }

    // creación simple (sin secuencias ni transacción)
    payload.gym_id = targetGymId;
    const created = await ClientRepository.create(payload);

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
    } else if ('gym_id' in payload) {
      if (!(await GymRepository.existsById(payload.gym_id))) payload.gym_id = current.gym_id;
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
