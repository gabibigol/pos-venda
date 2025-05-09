const ReportMetric = require('../models/ReportMetric');
const User = require('../models/User');
const ServiceOrder = require('../models/ServiceOrder');

class ReportService {
  /**
   * Gera relatório de métricas por técnico
   * @param {Object} options - Opções de filtro
   * @param {number} [options.technicianId] - ID do técnico
   * @param {Date} [options.startDate] - Data de início
   * @param {Date} [options.endDate] - Data de fim
   * @param {string} [options.reportType] - Tipo de relatório
   * @param {number} [options.page] - Página atual
   * @param {number} [options.limit] - Limite de registros por página
   * @returns {Object} Relatório de métricas do técnico
   */
  static async generateTechnicianReport(options = {}) {
    const {
      technicianId,
      startDate = new Date(new Date().getFullYear(), 0, 1),
      endDate = new Date(),
      reportType = 'MONTHLY',
      page = 1,
      limit = 10
    } = options;

    try {
      // Validar e ajustar datas
      if (!(startDate instanceof Date)) startDate = new Date(startDate);
      if (!(endDate instanceof Date)) endDate = new Date(endDate);

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Buscar métricas por técnico
      const metrics = await ReportMetric.calculateMetrics({
        startDate,
        endDate,
        technicianId,
        reportType,
        offset,
        limit
      });

      // Se um técnico específico foi solicitado, buscar detalhes adicionais
      let technicianDetails = null;

      if (technicianId) {
        technicianDetails = await User.findByPk(technicianId, {
          attributes: ['id', 'name', 'email']
        });
      }

      // Calcular métricas consolidadas
      const consolidatedMetrics = {
        totalServiceOrders: metrics.reduce((sum, m) => sum + parseInt(m.total_service_orders), 0),
        totalRevenue: metrics.reduce((sum, m) => sum + parseFloat(m.total_revenue), 0),
        averageServiceValue: metrics.reduce((sum, m) => sum + parseFloat(m.average_service_value), 0) / metrics.length,
        technicians: metrics.map(m => ({
          technicianId: m.technician_id,
          technicianName: m.technician_name,
          serviceOrders: parseInt(m.total_service_orders),
          revenue: parseFloat(m.total_revenue)
        }))
      };

      // Calcular total de registros (para paginação)
      const totalCount = await ReportMetric.count({
        where: {
          technicianId: technicianId || undefined,
          startDate: { [Op.between]: [startDate, endDate] }
        }
      });

      return {
        reportPeriod: {
          startDate,
          endDate,
          type: reportType
        },
        technicianDetails,
        metrics: consolidatedMetrics,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de técnico:', error);
      throw new Error('Falha ao gerar relatório de técnico');
    }
  }

  /**
   * Gera relatório consolidado do negócio
   * @param {Object} options - Opções de filtro
   * @param {Date} [options.startDate] - Data de início
   * @param {Date} [options.endDate] - Data de fim
   * @param {string} [options.reportType] - Tipo de relatório
   * @param {number} [options.page] - Página atual
   * @param {number} [options.limit] - Limite de registros por página
   * @returns {Object} Relatório consolidado
   */
  static async generateConsolidatedReport(options = {}) {
    const {
      startDate = new Date(new Date().getFullYear(), 0, 1),
      endDate = new Date(),
      reportType = 'MONTHLY',
      page = 1,
      limit = 10
    } = options;

    try {
      // Validar e ajustar datas
      if (!(startDate instanceof Date)) startDate = new Date(startDate);
      if (!(endDate instanceof Date)) endDate = new Date(endDate);

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Gerar relatório consolidado
      const consolidatedData = await ReportMetric.generateConsolidatedReport({
        startDate,
        endDate,
        reportType,
        offset,
        limit
      });

      // Calcular métricas de negócio
      const businessMetrics = {
        totalRevenue: consolidatedData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0),
        totalOrders: consolidatedData.reduce((sum, item) => sum + parseInt(item.total_orders), 0),
        topTechnicians: consolidatedData
          .reduce((acc, item) => {
            const existingTech = acc.find(tech => tech.technicianId === item.technician_id);

            if (existingTech) {
              existingTech.revenue += parseFloat(item.total_revenue);
              existingTech.orders += parseInt(item.total_orders);
            } else {
              acc.push({
                technicianId: item.technician_id,
                technicianName: item.technician_name,
                revenue: parseFloat(item.total_revenue),
                orders: parseInt(item.total_orders)
              });
            }

            return acc;
          }, [])
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5) // Top 5 técnicos
      };

      // Calcular total de registros (para paginação)
      const totalCount = await ReportMetric.count({
        where: {
          startDate: { [Op.between]: [startDate, endDate] }
        }
      });

      return {
        reportPeriod: {
          startDate,
          endDate,
          type: reportType
        },
        businessMetrics,
        detailedData: consolidatedData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório consolidado:', error);
      throw new Error('Falha ao gerar relatório consolidado');
    }
  }
}

module.exports = ReportService;
