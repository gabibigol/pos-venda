const FinancialService = require('../src/services/FinancialService');
const FinancialTransaction = require('../src/models/FinancialTransaction');
const { sequelize } = require('../src/config/database');
const mockTransactionData = { type: 'INCOME', amount: 500.00, category: 'SERVICE_ORDER' };

jest.mock('../src/models/FinancialTransaction');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('FinancialService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary successfully', async () => {
      const mockSummary = { totals: { income: 1000, expense: 500, balance: 500 }, summary: [] };

      FinancialTransaction.calculateFinancialSummary = jest.fn().mockResolvedValue(mockSummary);

      const result = await FinancialService.getFinancialSummary({ startDate: new Date(), endDate: new Date() });

      expect(result).toHaveProperty('totals');
      expect(result.totals.balance).toBe(500);
    });

    it('should throw an error if calculation fails', async () => {
      FinancialTransaction.calculateFinancialSummary = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(FinancialService.getFinancialSummary()).rejects.toThrow('Falha ao gerar resumo financeiro');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      FinancialTransaction.create = jest.fn().mockResolvedValue(mockTransactionData);
      const result = await FinancialService.createTransaction(mockTransactionData);

      expect(result).toHaveProperty('amount', 500.00);
    });

    it('should throw an error for invalid data', async () => {
      await expect(FinancialService.createTransaction({ type: 'INCOME', amount: -100, category: 'INVALID' })).rejects.toThrow('Valor da transação inválido');
    });
  });
});
