// src/domain/repositories/ClientMembershipRepository.js
const { Op } = require('sequelize');
const { ClientMembership, Client } = require('../../infrastructure/models');

class ClientMembershipRepository {
  static async findLatestActiveForClient(client_id, gym_id, asOf = new Date()) {
    return ClientMembership.findOne({
      where: {
        client_id,
        gym_id,
        status: 'Active',
        end_date: { [Op.gte]: asOf },
      },
      order: [['end_date','DESC'], ['id','DESC']],
    });
  }

  static async createBulk(rows, transaction) {
    return ClientMembership.bulkCreate(rows, { transaction });
  }

  static async findByPaymentId(payment_id) {
    return ClientMembership.findAll({
      where: { payment_id },
      include: [{ model: Client, as: 'client', attributes: ['id','first_name','last_name','code'] }],
      order: [['id','ASC']],
    });
  }
}

module.exports = ClientMembershipRepository;
