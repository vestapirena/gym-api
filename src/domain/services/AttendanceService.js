/**
 * Servicio: Attendance (check-in + sticky + lookup)
 * Lógica:
 * - Si NO hay membresía vigente => NO guardar, responde error
 * - reason se usa como nota libre en check-in permitido
 * - checked_in_at SIEMPRE lo calcula el backend (FE no lo manda)
 */
const { Op } = require('sequelize');

const AttendanceRepository = require('../repositories/AttendanceRepository');
const ClientRepository = require('../repositories/ClientRepository');
const { ClientMembership, Gym } = require('../../infrastructure/models');

function isAdmin(user) {
  const r = (user?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

class AttendanceService {
  static async list(params, currentUser, includeRefs = false) {
    const listParams = { ...params };

    // Owner / Staff: se fuerza al gym del usuario
    if (!isAdmin(currentUser) && currentUser?.gym_id) {
      listParams.gymId = currentUser.gym_id;
    }

    const pageData = await AttendanceRepository.findPaged(listParams);

    if (!includeRefs) {
      return pageData;
    }

    // Catálogo de gimnasios para el FE
    const refs = {};

    if (isAdmin(currentUser)) {
      const gyms = await Gym.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });
      refs.gyms = gyms;
    } else if (currentUser?.gym_id) {
      const gym = await Gym.findByPk(currentUser.gym_id, {
        attributes: ['id', 'name'],
      });
      refs.gyms = gym ? [gym] : [];
    } else {
      refs.gyms = [];
    }

    return { ...pageData, refs };
  }

  static async createAndReturnPage(payload, listParams, currentUser) {
    const now = new Date();

    // clonamos listParams para no mutar el original inesperadamente
    const paramsForList = { ...listParams };

    // gym por rol
    let targetGymId;
    if (isAdmin(currentUser)) {
      if (!payload.gym_id) {
        throw new Error('gym_id es obligatorio para administrador');
      }
      targetGymId = Number(payload.gym_id);
    } else {
      if (!currentUser?.gym_id) {
        throw new Error('No tienes gimnasio asignado');
      }
      targetGymId = currentUser.gym_id;
    }

    // 👇 aseguramos que la página que devolvemos está filtrada a ese gym
    paramsForList.gymId = targetGymId;

    // buscar cliente por gym + code
    const client = await ClientRepository.findByGymAndCode(
      targetGymId,
      payload.code
    );
    if (!client) {
      throw new Error(
        `Cliente con código ${payload.code} no existe en este gimnasio`
      );
    }

    // si cliente inactivo => NO guardar
    if (client.status !== 'Active') {
      throw new Error('Cliente inactivo');
    }

    // validar vigencia directo en ClientMembership
    const activeMembership = await ClientMembership.findOne({
      where: {
        gym_id: targetGymId,
        client_id: client.id,
        status: 'Active',
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
      order: [['end_date', 'DESC']],
    });

    if (!activeMembership) {
      throw new Error('No tiene membresía vigente');
    }

    const checkedInAt = now;

    const created = await AttendanceRepository.create({
      gym_id: targetGymId,
      client_id: client.id,
      client_membership_id: activeMembership.id,
      checked_in_at: checkedInAt,
      was_allowed: 1,
      reason: payload.reason || null,
      created_by: currentUser?.id || null,
    });

    const pageFor = await AttendanceRepository.getPageForId(
      created.id,
      paramsForList
    );
    const list = await this.list(
      { ...paramsForList, page: pageFor },
      currentUser
    );

    return { ...list, stickyId: created.id };
  }

  // Lookup por code dentro de asistencia (con fechas formateadas)
  static async lookupByCode(code, currentUser, query = {}) {
    let targetGymId;

    if (isAdmin(currentUser)) {
      if (!query.gym_id) throw new Error('gym_id es obligatorio para administrador');
      targetGymId = Number(query.gym_id);
    } else {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      targetGymId = currentUser.gym_id;
    }

    const client = await ClientRepository.findByGymAndCode(targetGymId, code);

    if (!client) {
      return {
        exists: false,
        client: null,
        has_active_membership: false,
        client_membership_id: null,
        membership_dates: null,
      };
    }

    const fmtDMY = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yy = dt.getFullYear();
      return `${dd}-${mm}-${yy}`;
    };

    const now = new Date();
    const activeMembership = await ClientMembership.findOne({
      where: {
        gym_id:   targetGymId,
        client_id: client.id,
        status:   'Active',
        start_date: { [Op.lte]: now },
        end_date:   { [Op.gte]: now },
      },
      order: [['end_date', 'DESC']],
    });

    return {
      exists: true,
      client,
      has_active_membership: !!activeMembership,
      client_membership_id: activeMembership?.id || null,
      membership_dates: activeMembership
        ? {
            start_date:      activeMembership.start_date,
            end_date:        activeMembership.end_date,
            start_date_fmt:  fmtDMY(activeMembership.start_date),
            end_date_fmt:    fmtDMY(activeMembership.end_date),
          }
        : null,
    };
  }
}

module.exports = AttendanceService;
