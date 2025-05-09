const express = require('express');
const ReportController = require('../controllers/ReportController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const AuditMiddleware = require('../middlewares/auditMiddleware');

const router = express.Router();

// Rota para relatório de técnico
router.get(
  '/technician',
  AuthMiddleware.authenticateToken, // Requer autenticação
  AuthMiddleware.checkPermissions(['ADMIN', 'MANAGER', 'TECHNICIAN']), // Permissões
  AuditMiddleware.logReportAccess(), // Log de acesso
  ReportController.validationRules().technicianReport, // Validações
  ReportController.validateRequest, // Middleware de validação
  ReportController.getTechnicianReport
);

// Rota para relatório consolidado
router.get(
  '/consolidated',
  AuthMiddleware.authenticateToken, // Requer autenticação
  AuthMiddleware.checkPermissions(['ADMIN', 'MANAGER']), // Permissões restritas
  AuditMiddleware.logReportAccess(), // Log de acesso
  ReportController.validationRules().consolidatedReport, // Validações
  ReportController.validateRequest, // Middleware de validação
  ReportController.getConsolidatedReport
);

// Rota para exportação de relatório
router.get(
  '/export',
  AuthMiddleware.authenticateToken, // Requer autenticação
  AuthMiddleware.checkPermissions(['ADMIN', 'MANAGER']), // Permissões restritas
  AuditMiddleware.logReportAccess(), // Log de acesso
  AuditMiddleware.logReportExport(), // Log de exportação
  ReportController.exportConsolidatedReport
);

module.exports = router;
