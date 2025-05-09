const FinancialTransaction = require('../models/FinancialTransaction');
const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const ReportExportService = require('./ReportExportService');

class FinancialService {
  /**
   * Gerar resumo financeiro
   * @param {Object} options - Opções de filtro
   * @returns {Object} Resumo financeiro
   */
  static async getFinancialSummary(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      type 
    } = options;

    try {
      // Calcular resumo financeiro
      const summary = await FinancialTransaction.calculateFinancialSummary({
        startDate,
        endDate,
        type
      });

      // Buscar detalhes adicionais
      const categoryBreakdown = summary.summary.reduce((acc, item) => {
        const { type, category, totalAmount, transactionCount } = item;
        
        if (!acc[type]) acc[type] = {};
        
        acc[type][category] = {
          totalAmount: parseFloat(totalAmount),
          transactionCount: parseInt(transactionCount)
        };
        
        return acc;
      }, {});

      return {
        period: { startDate, endDate },
        totals: summary.totals,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Erro ao gerar resumo financeiro:', error);
      throw new Error('Falha ao gerar resumo financeiro');
    }
  }

  /**
   * Obter transações de entrada
   * @param {Object} options - Opções de filtro
   * @returns {Object} Transações de entrada
   */
  static async getIncomeTransactions(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      page = 1,
      limit = 20,
      category 
    } = options;

    try {
      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir filtros
      const whereClause = {
        type: 'INCOME',
        transactionDate: {
          [FinancialTransaction.sequelize.Op.between]: [startDate, endDate]
        }
      };

      // Filtro opcional por categoria
      if (category) {
        whereClause.category = category;
      }

      // Buscar transações
      const { count, rows: transactions } = await FinancialTransaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name']
          }
        ],
        order: [['transactionDate', 'DESC']],
        limit,
        offset
      });

      return {
        transactions,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        period: { startDate, endDate }
      };
    } catch (error) {
      console.error('Erro ao buscar transações de entrada:', error);
      throw new Error('Falha ao buscar transações de entrada');
    }
  }

  /**
   * Obter transações de saída
   * @param {Object} options - Opções de filtro
   * @returns {Object} Transações de saída
   */
  static async getExpenseTransactions(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      page = 1,
      limit = 20,
      category 
    } = options;

    try {
      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir filtros
      const whereClause = {
        type: 'EXPENSE',
        transactionDate: {
          [FinancialTransaction.sequelize.Op.between]: [startDate, endDate]
        }
      };

      // Filtro opcional por categoria
      if (category) {
        whereClause.category = category;
      }

      // Buscar transações
      const { count, rows: transactions } = await FinancialTransaction.findAndCountAll({
        where: whereClause,
        order: [['transactionDate', 'DESC']],
        limit,
        offset
      });

      return {
        transactions,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        period: { startDate, endDate }
      };
    } catch (error) {
      console.error('Erro ao buscar transações de saída:', error);
      throw new Error('Falha ao buscar transações de saída');
    }
  }

  /**
   * Gerar relatório de fluxo de caixa
   * @param {Object} options - Opções de filtro
   * @returns {Object} Relatório de fluxo de caixa
   */
  static async generateCashFlowReport(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      groupBy = 'MONTHLY'
    } = options;

    try {
      // Gerar relatório de fluxo de caixa
      const cashFlowReport = await FinancialTransaction.generateCashFlowReport({
        startDate,
        endDate,
        groupBy
      });

      // Processamento adicional do relatório
      const processedCashFlow = cashFlowReport.cashFlow.map(entry => ({
        period: entry.period,
        totalIncome: parseFloat(entry.totalIncome || 0),
        totalExpense: parseFloat(entry.totalExpense || 0),
        balance: parseFloat(entry.balance || 0)
      }));

      return {
        cashFlow: processedCashFlow,
        period: { startDate, endDate },
        groupBy
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de fluxo de caixa:', error);
      throw new Error('Falha ao gerar relatório de fluxo de caixa');
    }
  }

  /**
   * Criar transação financeira com validações avançadas
   * @param {Object} transactionData - Dados da transação
   * @returns {Object} Transação criada
   */
  static async createTransaction(transactionData) {
    try {
      // Validações básicas
      if (!transactionData.type || !transactionData.amount || !transactionData.category) {
        throw new Error('Dados da transação incompletos');
      }

      // Validar valor
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Valor da transação inválido');
      }

      // Validar categoria baseada no tipo de transação
      const validIncomeCategories = [
        'SERVICE_ORDER', 'PRODUCT_SALE', 'COMMISSION', 'OTHER_INCOME'
      ];
      const validExpenseCategories = [
        'SALARY', 'SUPPLIER', 'EQUIPMENT', 'MAINTENANCE', 
        'UTILITIES', 'TAX', 'OTHER_EXPENSE'
      ];

      const categories = transactionData.type === 'INCOME' 
        ? validIncomeCategories 
        : validExpenseCategories;

      if (!categories.includes(transactionData.category)) {
        throw new Error(`Categoria inválida para transação de ${transactionData.type}`);
      }

      // Validar cliente, se fornecido
      if (transactionData.clientId) {
        const clientExists = await Client.findByPk(transactionData.clientId);
        if (!clientExists) {
          throw new Error('Cliente não encontrado');
        }
      }

      // Validar referência de ordem de serviço, se fornecida
      if (transactionData.referenceId && transactionData.origin === 'SERVICE_ORDER') {
        const serviceOrderExists = await ServiceOrder.findByPk(transactionData.referenceId);
        if (!serviceOrderExists) {
          throw new Error('Ordem de serviço não encontrada');
        }
      }

      // Definir data padrão se não fornecida
      transactionData.transactionDate = transactionData.transactionDate || new Date();

      // Definir status padrão
      transactionData.status = transactionData.status || 'PENDING';

      // Criar transação
      const transaction = await FinancialTransaction.create(transactionData);

      return transaction;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw new Error(error.message || 'Falha ao criar transação financeira');
    }
  }

  /**
   * Exportar relatório financeiro
   * @param {Object} options - Opções de exportação
   * @returns {string} Caminho do arquivo exportado
   */
  static async exportFinancialReport(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      format = 'pdf'
    } = options;

    try {
      // Gerar resumo financeiro
      const reportData = await this.getFinancialSummary({
        startDate,
        endDate
      });

      // Exportar relatório
      let filePath;
      switch(format.toLowerCase()) {
        case 'excel':
        case 'xlsx':
          filePath = await ReportExportService.exportFinancialReportToExcel(reportData);
          break;
        case 'pdf':
        default:
          filePath = await ReportExportService.exportFinancialReportToPDF(reportData);
      }

      return filePath;
    } catch (error) {
      console.error('Erro ao exportar relatório financeiro:', error);
      throw new Error('Falha ao exportar relatório financeiro');
    }
  }

  /**
   * Exportar transações
   * @param {Object} options - Opções de exportação
   * @returns {string} Caminho do arquivo exportado
   */
  static async exportTransactions(options = {}) {
    const { 
      startDate = new Date(new Date().getFullYear(), 0, 1), 
      endDate = new Date(),
      type,
      format = 'pdf'
    } = options;

    try {
      // Buscar transações
      const transactionsData = type === 'INCOME'
        ? await this.getIncomeTransactions({ startDate, endDate })
        : await this.getExpenseTransactions({ startDate, endDate });

      // Exportar transações
      let filePath;
      switch(format.toLowerCase()) {
        case 'excel':
        case 'xlsx':
          filePath = await ReportExportService.exportTransactionsToExcel(transactionsData);
          break;
        case 'pdf':
        default:
          filePath = await ReportExportService.exportTransactionsToPDF(transactionsData);
      }

      return filePath;
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      throw new Error('Falha ao exportar transações');
    }
  }
}

  /**
   * Criar transação financeira com validações avançadas
   * @param {Object} transactionData - Dados da transação
   * @returns {Object} Transação criada
   */
  static async createTransaction(transactionData) {
    try {
      // Validações básicas
      if (!transactionData.type || !transactionData.amount || !transactionData.category) {
        throw new Error('Dados da transação incompletos');
      }

      // Validar valor
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Valor da transação inválido');
      }

      // Validar categoria baseada no tipo de transação
      const validIncomeCategories = [
        'SERVICE_ORDER', 'PRODUCT_SALE', 'COMMISSION', 'OTHER_INCOME'
      ];
      const validExpenseCategories = [
        'SALARY', 'SUPPLIER', 'EQUIPMENT', 'MAINTENANCE', 
        'UTILITIES', 'TAX', 'OTHER_EXPENSE'
      ];

      const categories = transactionData.type === 'INCOME' 
        ? validIncomeCategories 
        : validExpenseCategories;

      if (!categories.includes(transactionData.category)) {
        throw new Error(`Categoria inválida para transação de ${transactionData.type}`);
      }

      // Validar cliente, se fornecido
      if (transactionData.clientId) {
        const clientExists = await Client.findByPk(transactionData.clientId);
        if (!clientExists) {
          throw new Error('Cliente não encontrado');
        }
      }

      // Validar referência de ordem de serviço, se fornecida
      if (transactionData.referenceId && transactionData.origin === 'SERVICE_ORDER') {
        const serviceOrderExists = await ServiceOrder.findByPk(transactionData.referenceId);
        if (!serviceOrderExists) {
          throw new Error('Ordem de serviço não encontrada');
        }
      }

      // Definir data padrão se não fornecida
      transactionData.transactionDate = transactionData.transactionDate || new Date();

      // Definir status padrão
      transactionData.status = transactionData.status || 'PENDING';
      transactionData.origin = transactionData.origin || 'MANUAL_ENTRY';

      // Criar transação
      const transaction = await FinancialTransaction.create(transactionData);

      return transaction;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw new Error(error.message || 'Falha ao criar transação financeira');
    }
  }
}

module.exports = FinancialService;