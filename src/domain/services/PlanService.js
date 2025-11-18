// /src/domain/services/PlanService.js
/**
 * Servicio: Planes
 * - Solo Admin (rutas ya filtran con checkRole).
 * - create/update: calculan price_gross y price en backend.
 * - Respuestas sticky: devuelven lista en la página donde queda el registro + stickyId.
 */
const PlanRepository = require('../repositories/PlanRepository');

function normalizePrices(payload) {
  // ignorar price_gross y price si vienen
  if ('price_gross' in payload) delete payload.price_gross;
  if ('price' in payload) delete payload.price;

  if (payload.price_net != null && payload.tax_rate != null) {
    const net = Number(payload.price_net);
    const rate = Number(payload.tax_rate);
    const gross = Math.round(net * (1 + rate) * 100) / 100; // 2 decimales
    payload.price_gross = gross;
    payload.price = gross; // precio final mostrado siempre en pesos
  }
  return payload;
}

class PlanService {
  static async list(params) {
    return PlanRepository.findPaged(params);
  }

  static async createAndReturnPage(payload, listParams) {
    normalizePrices(payload);
    const created = await PlanRepository.create(payload);
    const pageFor = await PlanRepository.getPageForId(created.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor });
    return { ...list, stickyId: created.id };
  }

  static async updateAndReturnPage(id, payload, listParams) {
    const current = await PlanRepository.findById(id);
    if (!current) throw new Error('Plan no encontrado');

    normalizePrices(payload);
    const updated = await PlanRepository.update(id, payload);

    const pageFor = await PlanRepository.getPageForId(updated.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor });
    return { ...list, stickyId: updated.id };
  }

  static async removeAndReturnPage(id, listParams) {
    await PlanRepository.destroy(id);
    const list = await this.list(listParams);
    const { page, totalPages } = list.meta;
    if (page > totalPages) return this.list({ ...listParams, page: totalPages });
    return list;
  }
}

module.exports = PlanService;
