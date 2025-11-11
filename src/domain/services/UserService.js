// src/domain/services/UserService.js
const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const RoleRepository = require('../repositories/RoleRepository');
const GymRepository  = require('../repositories/GymRepository');

// IDs según tu catálogo: 1=Administrator, 2=Gym Owner, 3=Staff
const ROLE_IDS = { ADMIN: 1, OWNER: 2, STAFF: 3 };

// Comportamiento solicitado: el ADMIN no valida gym_id
const SKIP_GYM_VALIDATION_FOR_ADMIN = true;

function isAdmin(currentUser) {
  const r = (currentUser?.role || '').toLowerCase();
  return r === 'admin' || r === 'administrator';
}

class UserService {
  // includeRefs: si es admin/owner y true, retorna refs acordes al alcance
  static async list(params, currentUser) {
    const { includeRefs, ...listParams } = params;

    // Owner solo ve su propio gym
    if (!isAdmin(currentUser) && currentUser?.gym_id) {
      listParams.gymId = currentUser.gym_id;
    }

    const data = await UserRepository.findPaged(listParams);

    if (includeRefs && (isAdmin(currentUser) || currentUser?.role === 'Gym Owner')) {
      if (isAdmin(currentUser)) {
        const [roles, gyms] = await Promise.all([
          RoleRepository.findAllSimple(),
          GymRepository.findAllSimple()
        ]);
        return { ...data, refs: { roles, gyms } };
      } else {
        const [roles, gym] = await Promise.all([
          RoleRepository.findStaffOnlySimple(ROLE_IDS.STAFF),
          GymRepository.findByIdSimple(currentUser.gym_id)
        ]);
        return { ...data, refs: { roles, gyms: gym ? [gym] : [] } };
      }
    }

    return data;
  }

  // CREATE
  static async create(payload, currentUser) {

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    if (!isAdmin(currentUser)) {
      // OWNER: ignorar cualquier role_id / gym_id recibido
      payload.role_id = ROLE_IDS.STAFF;
      payload.gym_id  = currentUser.gym_id;
    } else {
      // ADMIN:
      // Validar rol si lo manda
      if (payload.role_id && !(await RoleRepository.existsById(payload.role_id))) {
        throw new Error('El rol especificado no existe');
      }
      // Gym: NO validar (según lo solicitado). Si el gym no existe, lo dejamos en NULL
      if (!SKIP_GYM_VALIDATION_FOR_ADMIN) {
        if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
          throw new Error('El gimnasio especificado no existe');
        }
      } else {
        if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
          payload.gym_id = null; // prevenir FK error
        }
      }
    }

    return UserRepository.create(payload);
  }

  // UPDATE
  static async update(id, payload, currentUser) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const current = await UserRepository.findById(id);
    if (!current) throw new Error('Usuario no encontrado');

    if (!isAdmin(currentUser)) {
      // OWNER: solo usuarios de su gym
      if (currentUser?.gym_id && current.gym_id !== currentUser.gym_id) {
        throw new Error('No autorizado para modificar usuarios de otro gimnasio');
      }
      // OWNER: ignorar role_id / gym_id (no tronar)
      if ('role_id' in payload) delete payload.role_id;
      if ('gym_id'  in payload) delete payload.gym_id;

      // Blindaje adicional (por si acaso)
      payload.role_id = current.role_id;
      payload.gym_id  = current.gym_id;
    } else {
      // ADMIN:
      // Validar rol si lo cambia
      if (payload.role_id && !(await RoleRepository.existsById(payload.role_id))) {
        throw new Error('El rol especificado no existe');
      }
      // Gym: NO validar (según lo solicitado). Si no existe, conservar el actual o dejar NULL si es update de admin sin gym previo.
      if (SKIP_GYM_VALIDATION_FOR_ADMIN && 'gym_id' in payload) {
        if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
          // Si el admin mandó un gym inválido, preferimos no romper:
          // 1) si había uno previo, lo conservamos
          // 2) si no había, lo dejamos en null
          payload.gym_id = current.gym_id ?? null;
        }
      } else if ('gym_id' in payload) {
        if (payload.gym_id != null && !(await GymRepository.existsById(payload.gym_id))) {
          throw new Error('El gimnasio especificado no existe');
        }
      }
    }

    return UserRepository.update(id, payload);
  }

  // DELETE (y devolver lista recalculada)
  static async removeAndReturnPage(id, listParams, currentUser) {
    // Admin y Owner: no autoeliminarse
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
      // Si quieres limitar a Owner a borrar solo STAFF, descomenta:
      // if (victim.role_id !== ROLE_IDS.STAFF) throw new Error('Solo puedes eliminar usuarios con rol Staff');
    }
    // Admin: sin otras validaciones (no validamos gym en delete)

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
