const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const FinancialTransaction = require('../src/models/FinancialTransaction');

describe('Financial Module Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Configurar banco de testes
    await sequelize.sync({ force: true });

    // Autenticação para testes
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@carlimmirao.com',
        password: 'AdminPassword123!'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Financial Summary Endpoint', () => {
    it('should return financial summary', async () => {
      const response = await request(app)
        .get('/api/finance/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('totals');
      expect(response.body).toHaveProperty('categoryBreakdown');
    });
  });

  describe('Income Transactions Endpoint', () => {
    it('should return income transactions', async () => {
      const response = await request(app)
        .get('/api/finance/income')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('Expense Transactions Endpoint', () => {
    it('should return expense transactions', async () => {
      const response = await request(app)
        .get('/api/finance/expenses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('Cash Flow Report Endpoint', () => {
    it('should return cash flow report', async () => {
      const response = await request(app)
        .get('/api/finance/cash-flow')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('cashFlow');
      expect(response.body).toHaveProperty('period');
    });
  });

  describe('Create Financial Transaction', () => {
    it('should create a new financial transaction', async () => {
      const transactionData = {
        type: 'INCOME',
        amount: 500.00,
        category: 'SERVICE_ORDER',
        transactionDate: new Date().toISOString(),
        description: 'Test transaction',
        origin: 'MANUAL_ENTRY'
      };

      const response = await request(app)
        .post('/api/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('INCOME');
    });
  });
});
