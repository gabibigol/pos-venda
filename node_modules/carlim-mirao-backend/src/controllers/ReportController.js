const ReportService = require('../services/ReportService');
const ReportExportService = require('../services/ReportExportService');
const User = require('../models/User');
const { validationResult, query, param } = require('express-validator');

class ReportController {
  // Validações para os endpoints
  static validationRules() {
    return {
      technicianReport: [
        query('technicianId').optional().isInt().toInt(),
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('reportType').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
      ],
      consolidatedReport: [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('reportType').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
      ]
    };
  }

  /**
   * Middleware para validação de requisições
   */
  static async validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Erro de validação', 
        details: errors.array() 
      });
    }
    next();
  }

  /**
   * Endpoint para relatório de métricas por técnico
   * @route GET /api/reports/technician
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async getTechnicianReport(req, res) {
    try {
      const { 
        technicianId, 
        startDate, 
        endDate, 
        reportType,
        page = 1,
        limit = 10
      } = req.query;

      // Validar existência do técnico, se especificado
      if (technicianId) {
        const technicianExists = await User.findByPk(technicianId);
        if (!technicianExists) {
          return res.status(404).json({ 
            error: 'Técnico não encontrado' 
          });
        }
      }

      // Converter parâmetros para o tipo correto
      const options = {
        technicianId: technicianId ? parseInt(technicianId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        reportType: reportType || 'MONTHLY',
        page,
        limit
      };

      // Gerar relatório
      const report = await ReportService.generateTechnicianReport(options);

      res.status(200).json({
        ...report,
        pagination: {
          page,
          limit,
          // Adicionar total de páginas e total de registros se aplicável
        }
      });
    } catch (error) {
      console.error('Erro no relatório de técnico:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar relatório de técnico', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para relatório consolidado
   * @route GET /api/reports/consolidated
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async getConsolidatedReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        reportType,
        page = 1,
        limit = 10
      } = req.query;

      // Converter parâmetros para o tipo correto
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        reportType: reportType || 'MONTHLY',
        page,
        limit
      };

      // Gerar relatório consolidado
      const report = await ReportService.generateConsolidatedReport(options);

      res.status(200).json({
        ...report,
        pagination: {
          page,
          limit,
          // Adicionar total de páginas e total de registros se aplicável
        }
      });
    } catch (error) {
      console.error('Erro no relatório consolidado:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar relatório consolidado', 
        details: error.message 
      });
    }
  }
}
  /**
   * Exportar relatório consolidado
   * @route GET /api/reports/export
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async exportConsolidatedReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        reportType,
        format = 'pdf' // padrão PDF
      } = req.query;

      // Converter parâmetros para o tipo correto
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        reportType: reportType || 'MONTHLY'
      };

      // Gerar relatório consolidado
      const report = await ReportService.generateConsolidatedReport(options);

      // Exportar relatório
      let filePath;
      switch(format.toLowerCase()) {
        case 'excel':
        case 'xlsx':
          filePath = await ReportExportService.exportToExcel(report, 'consolidated_report');
          break;
        case 'pdf':
        default:
          filePath = await ReportExportService.exportToPDF(report, 'consolidated_report');
      }

      // Enviar arquivo para download
      res.download(filePath, `onmotor_report_${new Date().toISOString().split('T')[0]}.${format}`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      res.status(500).json({ 
        error: 'Erro ao exportar relatório', 
        details: error.message 
      });
    }
  }

module.exports = ReportController;