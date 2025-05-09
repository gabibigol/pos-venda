const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');

describe('Rotas Protegidas', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    // Sincronizar banco de dados de teste
    await sequelize.sync({ force: true });

    // Criar usuário admin
    const adminUser = await User.create({
      name: 'Admin Teste',
      email: 'admin@carlimmirao.com',
      password: 'senhaadmin123',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    // Criar usuário comum
    const regularUser = await User.create({
      name: 'Usuário Comum',
      email: 'usuario@carlimmirao.com',
      password: 'senhauser123',
      role: 'USER',
      status: 'ACTIVE'
    });

    // Gerar tokens
    adminToken = adminUser.generateToken();
    userToken = regularUser.generateToken();
  });

  afterAll(async () => {
    // Limpar banco de dados após os testes
    await sequelize.drop();
    await sequelize.close();
  });

  it('Deve acessar rota protegida genérica com token válido', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Rota protegida acessada com sucesso!');
  });

  it('Deve rejeitar rota protegida sem token', async () => {
    const response = await request(app)
      .get('/api/protected');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Token de autenticação não fornecido');
  });

  it('Deve permitir acesso de admin à rota administrativa', async () => {
    const response = await request(app)
      .get('/api/protected/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Rota administrativa acessada com sucesso!');
  });

  it('Deve rejeitar acesso de usuário comum à rota administrativa', async () => {
    const response = await request(app)
      .get('/api/protected/admin')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('error', 'Acesso negado');
  });
});
