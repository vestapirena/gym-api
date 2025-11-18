// /src/infrastructure/database/sequelize.config.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gym_saas',
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    // ⬇️ Logs SQL (controlado por env)
    logging:
      process.env.LOG_SQL === '1'
        ? (msg, timing) => {
            // msg ya trae el SQL; timing viene si benchmark:true
            console.log('[SQL]', msg, timing ? `(${timing} ms)` : '');
          }
        : false,
    benchmark: true,            // mide duración de cada query (se usa arriba)
    logQueryParameters: true,   // incluye valores de los parámetros
    define: {
      underscored: true,
      timestamps: true,
    },
    loggingOptions: {           // (Sequelize v6+)
      parameterSet: true,
    },
  }
);

// (opcional) mensaje al conectar
sequelize.authenticate()
  .then(() => console.log('DB ready'))
  .catch(err => console.error('DB error:', err));

module.exports = sequelize;
