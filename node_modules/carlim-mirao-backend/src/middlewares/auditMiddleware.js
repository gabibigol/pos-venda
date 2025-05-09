const AuditLogService = require('../services/AuditLogService');

class AuditMiddleware {
  /**
   * Middleware para registrar acesso a relatórios
   */
  static logReportAccess() {
    return (req, res, next) => {
      // Capturar informações da requisição
      const originalJson = res.json;

      res.json = function (body) {
        // Log após a requisição ser processada
        AuditLogService.logReportAccess({
          userId: req.user?.id,
          userEmail: req.user?.email,
          route: req.path,
          method: req.method,
          queryParams: req.query,
          timestamp: new Date().toISOString()
        });

        // Restaurar método original
        res.json = originalJson;

        return originalJson.call(this, body);
      };
      next();
    };
  }

  /**
   * Middleware para registrar exportações de relatórios
   */
  static logReportExport() {
    return (req, res, next) => {
      const originalDownload = res.download;

      res.download = function (filePath, filename) {
        // Log da exportação
        AuditLogService.logReportExport({
          userId: req.user?.id,
          userEmail: req.user?.email,
          route: req.path,
          method: req.method,
          exportFormat: req.query.format || 'pdf',
          filePath,
          filename,
          timestamp: new Date().toISOString()
        });

        // Restaurar método original
        res.download = originalDownload;

        return originalDownload.call(this, filePath, filename);
      };
      next();
    };
  }

  /**
   * Middleware para registrar tentativas de acesso negado
   */
  static logAccessDenied() {
    return (err, req, res, next) => {
      if (err.name === 'UnauthorizedError' || err.status === 401 || err.status === 403) {
        AuditLogService.logAccessDenied({
          userId: req.user?.id,
          userEmail: req.user?.email,
          route: req.path,
          method: req.method,
          ipAddress: req.ip,
          timestamp: new Date().toISOString()
        });
      }
      next(err);
    };
  }
}

module.exports = AuditMiddleware;
