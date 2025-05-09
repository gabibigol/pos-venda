const FinancialService = require('../services/FinancialService');
const { validationResult, query, body } = require('express-validator');

class FinancialController {
  /**
   * Regras de validação para endpoints financeiros
   */
  static validationRules() {
    return {
      summary: [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('type').optional().isIn(['INCOME', 'EXPENSE'])
      ],
      transactions: [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('category').optional()
      ],
      cashFlow: [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('groupBy').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
      ],
      createTransaction: [
        body('type').isIn(['INCOME', 'EXPENSE']),
        body('amount').isFloat({ min: 0 }),
        body('category').notEmpty(),
        body('transactionDate').optional().isISO8601().toDate(),
        body('description').optional(),
        body('clientId').optional().isInt(),
        body('origin').optional().isIn(['SERVICE_ORDER', 'PRODUCT_SALE', 'MANUAL_ENTRY']),
        body('status').optional().isIn(['PENDING', 'COMPLETED', 'CANCELED', 'OVERDUE'])
      ],
      export: [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('format').optional().isIn(['pdf', 'excel', 'xlsx']),
        query('type').optional().isIn(['INCOME', 'EXPENSE'])
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
   * Endpoint para resumo financeiro
   * @route GET /api/finance/summary
   */
  static async getFinancialSummary(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        type 
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type
      };

      // Buscar resumo financeiro
      const summary = await FinancialService.getFinancialSummary(options);

      res.status(200).json(summary);
    } catch (error) {
      console.error('Erro no resumo financeiro:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar resumo financeiro', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para transações de entrada
   * @route GET /api/finance/income
   */
  static async getIncomeTransactions(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        page,
        limit,
        category
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        category
      };

      // Buscar transações de entrada
      const transactions = await FinancialService.getIncomeTransactions(options);

      res.status(200).json(transactions);
    } catch (error) {
      console.error('Erro em transações de entrada:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar transações de entrada', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para transações de saída
   * @route GET /api/finance/expenses
   */
  static async getExpenseTransactions(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        page,
        limit,
        category
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        category
      };

      // Buscar transações de saída
      const transactions = await FinancialService.getExpenseTransactions(options);

      res.status(200).json(transactions);
    } catch (error) {
      console.error('Erro em transações de saída:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar transações de saída', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para relatório de fluxo de caixa
   * @route GET /api/finance/cash-flow
   */
  static async getCashFlowReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy 
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        groupBy
      };

      // Gerar relatório de fluxo de caixa
      const cashFlowReport = await FinancialService.generateCashFlowReport(options);

      res.status(200).json(cashFlowReport);
    } catch (error) {
      console.error('Erro no relatório de fluxo de caixa:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar relatório de fluxo de caixa', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para criar transação financeira
   * @route POST /api/finance/transactions
   */
  static async createTransaction(req, res) {
    try {
      const transactionData = {
        ...req.body,
        // Adicionar usuário que criou a transação
        userId: req.user.id
      };

      // Criar transação usando o serviço financeiro
      const transaction = await FinancialService.createTransaction(transactionData);

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Erro ao criar transação financeira:', error);
      
      // Tratamento de erros específicos
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Erro de validação',
          details: error.errors.map(e => e.message)
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Conflito de dados',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({ 
        error: 'Erro ao criar transação financeira', 
        details: error.message 
      });
    }
  }
    try {
      // Dados da transação do corpo da requisição
      const transactionData = req.body;

      // Adicionar usuário que criou a transação
      if (req.user) {
        transactionData.userId = req.user.id;
      }

      // Criar transação
      const transaction = await FinancialService.createTransaction(transactionData);

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ 
        error: 'Erro ao criar transação financeira', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para exportação de relatório financeiro
   * @route GET /api/finance/export/report
   */
  static async exportFinancialReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        format 
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        format
      };

      // Exportar relatório
      const filePath = await FinancialService.exportFinancialReport(options);

      // Enviar arquivo para download
      res.download(filePath, `financial_report_${new Date().toISOString().split('T')[0]}.${format || 'pdf'}`);
    } catch (error) {
      console.error('Erro na exportação de relatório financeiro:', error);
      res.status(500).json({ 
        error: 'Erro ao exportar relatório financeiro', 
        details: error.message 
      });
    }
  }

  /**
   * Endpoint para exportação de transações
   * @route GET /api/finance/export/transactions
   */
  static async exportTransactions(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        type,
        format 
      } = req.query;

      // Converter parâmetros
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
        format
      };

      // Exportar transações
      const filePath = await FinancialService.exportTransactions(options);

      // Enviar arquivo para download
      res.download(filePath, `financial_transactions_${new Date().toISOString().split('T')[0]}.${format || 'pdf'}`);
    } catch (error) {
      console.error('Erro na exportação de transações:', error);
      res.status(500).json({ 
        error: 'Erro ao exportar transações', 
        details: error.message 
      });
    }
  }
}

module.exports = FinancialController;