const FinancialService = require('../../src/services/FinancialService');
const FinancialTransaction = require('../../src/models/FinancialTransaction');

describe('FinancialService', () => {
  // Dados de mock para testes
  const mockTransactions = [
    {
      type: 'INCOME',
      amount: 1000.00,
      category: 'SERVICE_ORDER',
      transactionDate: new Date('2023-06-01')
    },
    {
      type: 'EXPENSE',
      amount: 500.00,
      category: 'MAINTENANCE',
      transactionDate: new Date('2023-06-02')
    }
  ];

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('getFinancialSummary deve retornar resumo correto', async () => {
    // Mockar método de cálculo de resumo
    jest.spyOn(FinancialTransaction, 'calculateFinancialSummary').mockResolvedValue({
      summary: [
        { type: 'INCOME', category: 'SERVICE_ORDER', totalAmount: 1000.00, transactionCount: 1 },
        { type: 'EXPENSE', category: 'MAINTENANCE', totalAmount: 500.00, transactionCount: 1 }
      ],
      totals: {
        income: 1000.00,
        expense: 500.00,
        balance: 500.00
      }
    });

    // Opções de teste
    const options = {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-06-30')
    };

    // Executar método
    const summary = await FinancialService.getFinancialSummary(options);

    // Verificações
    expect(summary).toBeDefined();
    expect(summary.totals.income).toBe(1000.00);
    expect(summary.totals.expense).toBe(500.00);
    expect(summary.totals.balance).toBe(500.00);
  });

  test('getIncomeTransactions deve retornar transações de entrada', async () => {
    // Mockar método de busca de transações
    jest.spyOn(FinancialTransaction, 'findAndCountAll').mockResolvedValue({
      count: 1,
      rows: [
        {
          type: 'INCOME',
          amount: 1000.00,
          category: 'SERVICE_ORDER'
        }
      ]
    });

    // Opções de teste
    const options = {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-06-30')
    };

    // Executar método
    const transactions = await FinancialService.getIncomeTransactions(options);

    // Verificações
    expect(transactions).toBeDefined();
    expect(transactions.transactions[0].type).toBe('INCOME');
    expect(transactions.pagination.total).toBe(1);
  });

  test('createTransaction deve criar transação corretamente', async () => {
    // Mockar método de criação de transação
    jest.spyOn(FinancialTransaction, 'create').mockResolvedValue({
      id: 1,
      ...mockTransactions[0]
    });

    // Executar método
    const transaction = await FinancialService.createTransaction(mockTransactions[0]);

    // Verificações
    expect(transaction).toBeDefined();
    expect(transaction.type).toBe('INCOME');
    expect(transaction.amount).toBe(1000.00);
  });

  test('Tratamento de erro em createTransaction', async () => {
    // Dados inválidos
    const invalidTransaction = {
      amount: 1000.00
    };

    // Verificar se o erro é tratado corretamente
    await expect(FinancialService.createTransaction(invalidTransaction))
      .rejects.toThrow('Dados da transação incompletos');
  });
});
