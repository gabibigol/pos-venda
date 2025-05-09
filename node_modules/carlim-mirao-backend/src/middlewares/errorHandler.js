const winston = require('winston');
const { testConnection } = require('../config/database');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/errors.log'
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  logger.error(`[${req.method} ${req.path}] ${err.message}`, {
    method: req.method,
    path: req.path,
    error: err
  });

  res.status(statusCode).json(errorResponse);
};

const healthCheckController = async (req, res) => {
  try {
    const dbConnected = await testConnection();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

module.exports = {
  errorHandler,
  healthCheckController
};
