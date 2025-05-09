const { Sequelize } = require('sequelize');
const winston = require('winston');

require('dotenv').config();

// Configuração de Logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/database.log'
    })
  ]
});

// Configuração de Conexão
const sequelize = new Sequelize(
  process.env.DB_NAME || 'carlim_mirao',
  process.env.DB_USER || 'carlim_user',
  process.env.DB_PASSWORD || 'carlim_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? (msg) => logger.info(msg) : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  }
);

// Função de Teste de Conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');

    return true;
  } catch (error) {
    logger.error('Erro ao conectar ao banco de dados:', error);

    return false;
  }
}

// Função para inicializar o banco de dados
async function initDatabase() {
  try {
    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    const alterSync = process.env.DB_ALTER_SYNC === 'true';

    await sequelize.sync({
      force: forceSync,
      alter: alterSync
    });

    logger.info(`Banco de dados sincronizado. Force Sync: ${forceSync}, Alter Sync: ${alterSync}`);

    return true;
  } catch (error) {
    logger.error('Erro ao sincronizar banco de dados:', error);

    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
  logger
};
