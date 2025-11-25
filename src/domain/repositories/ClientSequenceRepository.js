const { ClientSequence } = require('../../infrastructure/models');
const sequelize = require('../../infrastructure/database/sequelize.config');

function pad4(n) {
  return String(n).padStart(4, '0'); // 1 → "0001"
}

class ClientSequenceRepository {
  /**
   * Devuelve el siguiente código de 4 dígitos para un gym, con bloqueo transaccional.
   * - Usa SELECT ... FOR UPDATE implícito (mediante UPDATE) para evitar colisiones.
   */
  static async nextForGym(gymId, transaction) {
    if (!transaction) {
      throw new Error('nextForGym requiere una transacción abierta');
    }

    // "Upsert" manual dentro de la transacción
    const row = await ClientSequence.findByPk(gymId, { transaction, lock: transaction.LOCK.UPDATE });
    let next;
    if (!row) {
      next = 1;
      await ClientSequence.create({ gym_id: gymId, last_value: next }, { transaction });
    } else {
      next = row.last_value + 1;
      if (next > 9999) {
        throw new Error('Límite de códigos alcanzado para este gimnasio (9999)');
      }
      row.last_value = next;
      await row.save({ transaction });
    }
    return pad4(next);
  }
}

module.exports = ClientSequenceRepository;
