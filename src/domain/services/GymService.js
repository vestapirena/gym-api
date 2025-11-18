/**
 * Servicio: Gimnasios
 * - includeRefs=1 → { plans:[...] }
 * - create/update → devuelven lista "sticky" y stickyId
 * - delete → lista recalculada
 */
const GymRepository  = require('../repositories/GymRepository');
const PlanRepository = require('../repositories/PlanRepository');

class GymService {
  static async list(params) {
    const { includeRefs, ...listParams } = params;
    const data = await GymRepository.findPaged(listParams);

    if (includeRefs) {
      const plans = await PlanRepository.findAllSimple();
      return { ...data, refs: { plans } };
    }
    return data;
  }

  static async createAndReturnPage(payload, listParams) {
    if (!(await PlanRepository.existsById(payload.plan_id))) {
      throw new Error('El plan especificado no existe');
    }

    const created = await GymRepository.create(payload);
    const pageForItem = await GymRepository.getPageForId(created.id, listParams);
    const list = await this.list({ ...listParams, page: pageForItem });
    return { ...list, stickyId: created.id };
  }

  static async updateAndReturnPage(id, payload, listParams) {
    const current = await GymRepository.findById(id);
    if (!current) throw new Error('Gimnasio no encontrado');

    if ('plan_id' in payload) {
      if (!(await PlanRepository.existsById(payload.plan_id))) {
        payload.plan_id = current.plan_id ?? null;
      }
    }

    const updated = await GymRepository.update(id, payload);
    const pageForItem = await GymRepository.getPageForId(updated.id, listParams);
    const list = await this.list({ ...listParams, page: pageForItem });
    return { ...list, stickyId: updated.id };
  }

  static async removeAndReturnPage(id, listParams) {
    await GymRepository.destroy(id);
    const result = await this.list(listParams);
    const { page, totalPages } = result.meta;
    if (page > totalPages) return this.list({ ...listParams, page: totalPages });
    return result;
  }
}

module.exports = GymService;
