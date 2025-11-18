// /src/app/middlewares/reqProbe.js
module.exports = (label = 'PROBE') => (req, _res, next) => {
  const u = req.user || {};
  console.log(
    `[${label}] ${req.method} ${req.originalUrl}  ` +
    `user={ id:${u.id ?? '-'}, role:${u.role ?? '-'}, gym_id:${u.gym_id ?? '-'} }`
  );
  next();
};
