const FinancialController = require('../../src/controllers/FinancialController');
const FinancialService = require('../../src/services/FinancialService');

describe('FinancialController', () => {
  // Mocks de requisição e resposta
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      query: {},
      body: {},
      user: { id: 1, role: 'ADMIN' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('getFinancialSummary deve retornar resumo financeiro', async () => {
    // Preparar dados de mock
    mockReq.query = {
      startDate: '2023-06-01',
      endDate: '2023-06-30'
    };

    // Mockar serviço
    jest.spyOn(FinancialService, 'getFinancialSummary').mockResolvedValue({
      totals: {
        income: 1000.00,
        expense: 500.00,
        balance: 500.00
      }
    });

    // Executar método
    await FinancialController.getFinancialSummary(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      totals: expect.objectContaining({
        income: 1000.00,
        expense: 500.00,
        balance: 500.00
      })
    }));
  });

  test('getIncomeTransactions deve retornar transações de entrada', async () => {
    // Preparar dados de mock
    mockReq.query = {
      startDate: '2023-06-01',
      endDate: '2023-06-30'
    };

    // Mockar serviço
    jest.spyOn(FinancialService, 'getIncomeTransactions').mockResolvedValue({
      transactions: [
        {
          type: 'INCOME',
          amount: 1000.00,
          category: 'SERVICE_ORDER'
        }
      ],
      pagination: {
        total: 1
      }
    });

    // Executar método
    await FinancialController.getIncomeTransactions(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          type: 'INCOME',
          amount: 1000.00
        })
      ])
    }));
  });

  test('createTransaction deve criar transação', async () => {
    // Preparar dados de transação
    mockReq.body = {
      type: 'INCOME',
      amount: 1000.00,
      category: 'SERVICE_ORDER'
    };

    // Mockar serviço
    jest.spyOn(FinancialService, 'createTransaction').mockResolvedValue({
      id: 1,
      ...mockReq.body
    });

    // Executar método
    await FinancialController.createTransaction(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      type: 'INCOME',
      amount: 1000.00
    }));
  });

  test('Tratamento de erro em getFinancialSummary', async () => {
    // Mockar serviço para lançar erro
    jest.spyOn(FinancialService, 'getFinancialSummary').mockRejectedValue(
      new Error('Erro de teste')
    );

    // Executar método
    await FinancialController.getFinancialSummary(mockReq, mockRes);

    // Verificações
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Erro ao gerar resumo financeiro'
    }));
  });
});
