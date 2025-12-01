// src/domain/services/PaymentService.js
/**
 * Servicio: Payments (wizard)
 * PASOS:
 * 1) recibe membership_id
 * 2) recibe clientes por code
 * 3) recibe UNA fecha deseada (start_date) opcional
 * 4) calcula fechas reales por cliente respetando vigencias
 * 5) guarda y devuelve lista sticky/paginada
 */
const sequelize = require('../../infrastructure/database/sequelize.config');
const { Membership, Client } = require('../../infrastructure/models');

const PaymentRepository = require('../repositories/PaymentRepository');
const ClientMembershipRepository = require('../repositories/ClientMembershipRepository');
const GymRepository = require('../repositories/GymRepository');

function isAdmin(user) {
  const r = (user?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

function round2(n){ return Math.round(Number(n) * 100) / 100; }

function addPeriod(startDate, unit, value) {
  const d = new Date(startDate);
  const v = Number(value);
  if (unit === 'day')   d.setDate(d.getDate() + v);
  if (unit === 'month') d.setMonth(d.getMonth() + v);
  if (unit === 'year')  d.setFullYear(d.getFullYear() + v);
  return d;
}

class PaymentService {
  static async list(params, currentUser) {
    const { includeRefs, ...listParams } = params;           // 👈 separar includeRefs

    // Si no es admin, se fuerza a su gym_id
    if (!isAdmin(currentUser) && currentUser?.gym_id) {
      listParams.gymId = currentUser.gym_id;
    }

    const data = await PaymentRepository.findPaged(listParams);

    // Solo admin + includeRefs=1 → devolver catálogo de gimnasios
    if (includeRefs && isAdmin(currentUser)) {
      const gyms = await GymRepository.findAllSimple();
      return { ...data, refs: { gyms } };
    }

    return data;
  }

  static async createAndReturnPage(payload, listParams, currentUser) {
    const now = new Date();

    // 1) membership
    const membership = await Membership.findByPk(payload.membership_id);
    if (!membership) throw new Error('Membresía no encontrada');

    // 2) permisos por gym
    const gymIdFromMembership = membership.gym_id;
    let targetGymId;
    if (isAdmin(currentUser)) {
      targetGymId = gymIdFromMembership;
    } else {
      if (!currentUser?.gym_id) throw new Error('No tienes gimnasio asignado');
      if (currentUser.gym_id !== gymIdFromMembership) {
        throw new Error('No autorizado para cobrar membresías de otro gimnasio');
      }
      targetGymId = currentUser.gym_id;
    }

    // 3) validar cantidad de personas
    const clientsSel = payload.clients || [];
    if (clientsSel.length > Number(membership.personas || 1)) {
      throw new Error(`Esta membresía permite máximo ${membership.personas} persona(s)`);
    }

    // fecha deseada única del wizard (opcional)
    const globalDesired = payload.start_date ? new Date(payload.start_date) : null;
    if (globalDesired && globalDesired.getTime() < now.getTime()) {
      throw new Error('start_date no puede ser pasada');
    }

    // 4) resolver clientes + fechas reales
    const computedRows = [];

    for (const sel of clientsSel) {
      const client = await Client.findOne({
        where: { gym_id: targetGymId, code: sel.code }
      });
      if (!client) throw new Error(`Cliente con código ${sel.code} no existe en este gimnasio`);

      const active = await ClientMembershipRepository.findLatestActiveForClient(client.id, targetGymId, now);

      let desired = sel.start_date ? new Date(sel.start_date) : globalDesired;
      if (desired && desired.getTime() < now.getTime()) {
        throw new Error(`start_date no puede ser pasada para ${sel.code}`);
      }

      let startReal;
      if (active) {
        const minStart = new Date(new Date(active.end_date).getTime() + 1000); // 1s después
        if (!desired || desired.getTime() < minStart.getTime()) startReal = minStart;
        else startReal = desired;
      } else {
        startReal = desired || now;
      }

      const endPlus = addPeriod(startReal, membership.period_unit, membership.period_value);
      const endReal = new Date(endPlus.getTime() - 1000); // inclusive

      computedRows.push({
        gym_id: targetGymId,
        client_id: client.id,
        membership_id: membership.id,
        start_date: startReal,
        end_date: endReal,
        status: 'Active',
      });
    }

    // 5) guardar payment + client_memberships en transacción
    const net = Number(membership.price_net);
    const rate = Number(membership.tax_rate);
    const gross = round2(net * (1 + rate));

    const createdPayment = await sequelize.transaction(async (t) => {
      const pay = await PaymentRepository.create({
        gym_id: targetGymId,
        membership_id: membership.id,
        amount_net: net,
        tax_rate: rate,
        amount_gross: gross,
        amount_paid: gross,
        payment_method: payload.payment_method,
        paid_at: now,
        status: 'Paid',
        created_by: currentUser?.id || null,
      }, t);

      const rowsWithPayment = computedRows.map(r => ({ ...r, payment_id: pay.id }));
      await ClientMembershipRepository.createBulk(rowsWithPayment, t);

      return pay;
    });

    const pageFor = await PaymentRepository.getPageForId(createdPayment.id, listParams);
    const list = await this.list({ ...listParams, page: pageFor }, currentUser);

    return { ...list, stickyId: createdPayment.id };
  }
}

module.exports = PaymentService;
