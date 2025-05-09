const ReportService = require('../src/services/ReportService');
const ReportMetric = require('../src/models/ReportMetric');
const User = require('../src/models/User');

describe('ReportService', () => {
  // Mock de dados para testes
  const mockMetrics = [
    {
      technician_id: 1,
      technician_name: 'João Silva',
      total_service_orders: 10,
      total_revenue: 1500.00,
      average_service_value: 150.00
    }
  ];

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('generateTechnicianReport deve retornar métricas corretas', async () => {
    // Mockar métodos do modelo
    jest.spyOn(ReportMetric, 'calculateMetrics').mockResolvedValue(mockMetrics);
    jest.spyOn(User, 'findByPk').mockResolvedValue({
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com'
    });

    // Opções de teste
    const options = {
      technicianId: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      reportType: 'MONTHLY'
    };

    // Executar método
    const report = await ReportService.generateTechnicianReport(options);

    // Verificações
    expect(report).toBeDefined();
    expect(report.metrics.totalServiceOrders).toBe(10);
    expect(report.metrics.totalRevenue).toBe(1500.00);
    expect(report.technicianDetails.name).toBe('João Silva');
  });

  test('generateConsolidatedReport deve retornar métricas consolidadas', async () => {
    // Mockar método de relatório consolidado
    jest.spyOn(ReportMetric, 'generateConsolidatedReport').mockResolvedValue(mockMetrics);

    // Opções de teste
    const options = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      reportType: 'MONTHLY'
    };

    // Executar método
    const report = await ReportService.generateConsolidatedReport(options);

    // Verificações
    expect(report).toBeDefined();
    expect(report.businessMetrics.totalRevenue).toBe(1500.00);
    expect(report.businessMetrics.totalOrders).toBe(10);
  });

  test('Tratamento de erro em generateTechnicianReport', async () => {
    // Forçar erro
    jest.spyOn(ReportMetric, 'calculateMetrics').mockRejectedValue(new Error('Erro de teste'));

    // Opções de teste
    const options = {
      technicianId: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31')
    };

    // Verificar se o erro é tratado corretamente
    await expect(ReportService.generateTechnicianReport(options)).rejects.toThrow('Falha ao gerar relatório de técnico');
  });
});
