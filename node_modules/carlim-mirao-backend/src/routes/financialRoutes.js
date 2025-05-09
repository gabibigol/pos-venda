const express = require('express');
const FinancialController = require('../controllers/FinancialController');
const authMiddleware = require('../middlewares/authMiddleware');
const auditMiddleware = require('../middlewares/auditMiddleware');

const router = express.Router();

// Middleware de autenticação e auditoria para todas as rotas financeiras
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['ADMIN', 'MANAGER', 'FINANCIAL']));

// Rotas de resumo financeiro
router.get(
  '/summary', 
  FinancialController.validationRules().summary,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_FINANCIAL_SUMMARY'),
  FinancialController.getFinancialSummary
);

// Rotas de transações de entrada
router.get(
  '/income', 
  FinancialController.validationRules().transactions,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_INCOME_TRANSACTIONS'),
  FinancialController.getIncomeTransactions
);

// Rotas de transações de saída
router.get(
  '/expenses', 
  FinancialController.validationRules().transactions,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_EXPENSE_TRANSACTIONS'),
  FinancialController.getExpenseTransactions
);

// Rotas de fluxo de caixa
router.get(
  '/cash-flow', 
  FinancialController.validationRules().cashFlow,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_CASH_FLOW_REPORT'),
  FinancialController.getCashFlowReport
);

// Rotas de criação de transação
router.post(
  '/transactions', 
  FinancialController.validationRules().createTransaction,
  FinancialController.validateRequest,
  auditMiddleware.logAction('CREATE_FINANCIAL_TRANSACTION'),
  FinancialController.createTransaction
);

// Rotas de exportação de relatório financeiro
router.get(
  '/export/report', 
  FinancialController.validationRules().export,
  FinancialController.validateRequest,
  auditMiddleware.logAction('EXPORT_FINANCIAL_REPORT'),
  FinancialController.exportFinancialReport
);

// Rotas de exportação de transações
router.get(
  '/export/transactions', 
  FinancialController.validationRules().export,
  FinancialController.validateRequest,
  auditMiddleware.logAction('EXPORT_FINANCIAL_TRANSACTIONS'),
  FinancialController.exportTransactions
);

module.exports = router;const express = require('express');
const FinancialController = require('../controllers/FinancialController');
const authMiddleware = require('../middlewares/authMiddleware');
const auditMiddleware = require('../middlewares/auditMiddleware');

const router = express.Router();

// Middleware de autenticação e auditoria para todas as rotas financeiras
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['ADMIN', 'MANAGER', 'FINANCIAL']));

// Rotas de resumo financeiro
router.get(
  '/summary', 
  FinancialController.validationRules().summary,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_FINANCIAL_SUMMARY'),
  FinancialController.getFinancialSummary
);

// Rotas de transações de entrada
router.get(
  '/income', 
  FinancialController.validationRules().transactions,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_INCOME_TRANSACTIONS'),
  FinancialController.getIncomeTransactions
);

// Rotas de transações de saída
router.get(
  '/expenses', 
  FinancialController.validationRules().transactions,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_EXPENSE_TRANSACTIONS'),
  FinancialController.getExpenseTransactions
);

// Rotas de fluxo de caixa
router.get(
  '/cash-flow', 
  FinancialController.validationRules().cashFlow,
  FinancialController.validateRequest,
  auditMiddleware.logAction('ACCESS_CASH_FLOW_REPORT'),
  FinancialController.getCashFlowReport
);

// Rotas de criação de transação
router.post(
  '/transactions', 
  FinancialController.validationRules().createTransaction,
  FinancialController.validateRequest,
  auditMiddleware.logAction('CREATE_FINANCIAL_TRANSACTION'),
  FinancialController.createTransaction
);

// Rotas de exportação de relatório financeiro
router.get(
  '/export/report', 
  FinancialController.validationRules().export,
  FinancialController.validateRequest,
  auditMiddleware.logAction('EXPORT_FINANCIAL_REPORT'),
  FinancialController.exportFinancialReport
);

// Rotas de exportação de transações
router.get(
  '/export/transactions', 
  FinancialController.validationRules().export,
  FinancialController.validateRequest,
  auditMiddleware.logAction('EXPORT_FINANCIAL_TRANSACTIONS'),
  FinancialController.exportTransactions
);

module.exports = router;