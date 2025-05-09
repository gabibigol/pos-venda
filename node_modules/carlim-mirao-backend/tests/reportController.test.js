const ReportController = require('../src/controllers/ReportController');
const ReportService = require('../src/services/ReportService');
const User = require('../src/models/User');

describe('ReportController', () => {
  // Mocks de requisição e resposta
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      query: {},
      user: { id: 1, role: 'ADMIN' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      download: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('getTechnicianReport deve retornar relatório de técnico', async () => {
    // Preparar dados de mock
    mockReq.query = {
      technicianId: '1',
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    };

    // Mockar serviço e verificação de usuário
    jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1, name: 'Técnico Teste' });
    jest.spyOn(ReportService, 'generateTechnicianReport').mockResolvedValue({
      metrics: { totalServiceOrders: 10 }
    });

    // Executar método
    await ReportController.getTechnicianReport(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      metrics: expect.objectContaining({
        totalServiceOrders: 10
      })
    }));
  });

  test('getConsolidatedReport deve retornar relatório consolidado', async () => {
    // Preparar dados de mock
    mockReq.query = {
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    };

    // Mockar serviço
    jest.spyOn(ReportService, 'generateConsolidatedReport').mockResolvedValue({
      businessMetrics: { totalRevenue: 5000 }
    });

    // Executar método
    await ReportController.getConsolidatedReport(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      businessMetrics: expect.objectContaining({
        totalRevenue: 5000
      })
    }));
  });

  test('exportConsolidatedReport deve gerar arquivo de exportação', async () => {
    // Preparar dados de mock
    mockReq.query = {
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      format: 'pdf'
    };

    // Mockar serviços
    jest.spyOn(ReportService, 'generateConsolidatedReport').mockResolvedValue({
      businessMetrics: { totalRevenue: 5000 }
    });
    jest.spyOn(require('../src/services/ReportExportService'), 'exportToPDF')
      .mockResolvedValue('/path/to/report.pdf');

    // Executar método
    await ReportController.exportConsolidatedReport(mockReq, mockRes);

    // Verificações
    expect(mockRes.download).toHaveBeenCalledWith(
      '/path/to/report.pdf',
      expect.stringContaining('onmotor_report_')
    );
  });

  test('Tratamento de erro em getTechnicianReport', async () => {
    // Preparar dados de mock com ID inválido
    mockReq.query = { technicianId: '999' };

    // Mockar verificação de usuário para retornar null
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    // Executar método
    await ReportController.getTechnicianReport(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Técnico não encontrado'
    }));
  });
});
