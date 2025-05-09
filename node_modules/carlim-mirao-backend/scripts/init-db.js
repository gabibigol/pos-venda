const { sequelize, testConnection, initDatabase } = require('../src/config/database');
const User = require('../src/models/User');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/init-db.log'
    })
  ]
});

async function initDB() {
  try {
    // Testar conexão
    const connectionSuccess = await testConnection();

    if (!connectionSuccess) {
      logger.error('Falha na conexão com o banco de dados');
      process.exit(1);
    }

    // Inicializar banco de dados
    const initSuccess = await initDatabase();

    if (!initSuccess) {
      logger.error('Falha na inicialização do banco de dados');
      process.exit(1);
    }

    // Criar usuário admin padrão (opcional)
    const existingAdmin = await User.findOne({
      where: {
        username: 'admin',
        role: 'admin'
      }
    });

    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@carlimmirao.com',
        password: 'AdminPassword123!@#', // Alterar em produção
        role: 'admin',
        isActive: true
      });
      logger.info('Usuário admin criado com sucesso.');
    }

    logger.info('Inicialização do banco de dados concluída.');
    process.exit(0);
  } catch (error) {
    logger.error('Erro crítico durante inicialização:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

initDB();
