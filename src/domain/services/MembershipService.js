const MembershipRepository = require('../repositories/MembershipRepository');
const GymRepository        = require('../repositories/GymRepository');

function isAdmin(user) {
  const r = (user?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

function normalizePrices(payload) {
  if ('price' in payload) delete payload.price;
  if ('price_gross' in payload) delete payload.price_gross;
  if (payload.price_net != null && payload.tax_rate != null) {
    const net  = Number(payload.price_net);
    const rate = Number(payload.tax_rate);
    const gross = Math.round(net * (1 + rate) * 100) / 100;
    payload.price_gross = gross;
    payload.price = gross;
  }
  return payload;
}

class MembershipService {
  static async list(params, currentUser) {
    const { includeRefs, ...listParams } = params; // includeRefs no se usa aquí; lo dejo por simetría
    if (!isAdmin(currentUser) && currentUser?.gym_id) listParams.gymId = currentUser.gym_id;
    return MembershipRepository.findPaged(listParams);
  }

  static async createAndReturnPage(payload, listParams, currentUser) {
    let targetGymId;
    if (!isAdmin(currentUser)) {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      targetGymId = currentUser.gym_id;
    } else {
      if (payload.gym_id == null) throw new Error('gym_id es obligatorio');
      if (!(await GymRepository.existsById(payload.gym_id))) throw new Error('El gimnasio especificado no existe');
      targetGymId = payload.gym_id;
    }

    payload.gym_id = targetGymId;
    normalizePrices(payload);

    const created = await MembershipRepository.create(payload);
    const pageFor = await MembershipRepository.getPageForId(created.id, listParams);
    const list    = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: created.id };
  }

  static async updateAndReturnPage(id, payload, listParams, currentUser) {
    const current = await MembershipRepository.findById(id);
    if (!current) throw new Error('Membresía no encontrada');

    if (!isAdmin(currentUser)) {
      if (currentUser?.gym_id && current.gym_id !== currentUser.gym_id) {
        throw new Error('No autorizado para modificar membresías de otro gimnasio');
      }
      if ('gym_id' in payload) delete payload.gym_id;
    } else if ('gym_id' in payload) {
      if (!(await GymRepository.existsById(payload.gym_id))) payload.gym_id = current.gym_id;
    }

    normalizePrices(payload);
    const updated = await MembershipRepository.update(id, payload);

    const pageFor = await MembershipRepository.getPageForId(updated.id, listParams);
    const list    = await this.list({ ...listParams, page: pageFor }, currentUser);
    return { ...list, stickyId: updated.id };
  }

  static async removeAndReturnPage(id, listParams, currentUser) {
    const victim = await MembershipRepository.findById(id);
    if (!victim) throw new Error('Membresía no encontrada');

    if (!isAdmin(currentUser) && currentUser?.gym_id && victim.gym_id !== currentUser.gym_id) {
      throw new Error('No autorizado para eliminar membresías de otro gimnasio');
    }

    await MembershipRepository.destroy(id);
    const list = await this.list(listParams, currentUser);
    const { page, totalPages } = list.meta;
    if (page > totalPages) return this.list({ ...listParams, page: totalPages }, currentUser);
    return list;
  }
}

module.exports = MembershipService;
