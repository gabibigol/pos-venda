const fs = require('fs');
const path = require('path');
const winston = require('winston');

require('dotenv').config();

class AuditLogService {
  constructor() {
    // Garantir que o diretório de logs exista
    const logDir = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), 'logs', 'audit');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Configuração do logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Log para arquivo
        new winston.transports.File({
          filename: path.join(logDir, 'audit.log'),
          maxsize: (process.env.MAX_AUDIT_LOG_SIZE_MB || 100) * 1024 * 1024, // Padrão 100MB
          maxFiles: 5
        }),
        // Log para console durante desenvolvimento
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  /**
   * Registrar log de acesso a relatório
   * @param {Object} data - Dados de auditoria
   */
  logReportAccess(data) {
    this.logger.info('REPORT_ACCESS', {
      type: 'report_access',
      ...data
    });
  }

  /**
   * Registrar log de exportação de relatório
   * @param {Object} data - Dados de exportação
   */
  logReportExport(data) {
    this.logger.info('REPORT_EXPORT', {
      type: 'report_export',
      ...data
    });
  }

  /**
   * Registrar tentativa de acesso negado
   * @param {Object} data - Dados de tentativa de acesso
   */
  logAccessDenied(data) {
    this.logger.warn('ACCESS_DENIED', {
      type: 'access_denied',
      ...data
    });
  }

  /**
   * Registrar erro de sistema
   * @param {Object} data - Dados do erro
   */
  logSystemError(data) {
    this.logger.error('SYSTEM_ERROR', {
      type: 'system_error',
      ...data
    });
  }
}

module.exports = new AuditLogService();
