const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');

describe('Autenticação', () => {
  let testUser;

  beforeAll(async () => {
    // Sincronizar banco de dados de teste
    await sequelize.sync({ force: true });

    // Criar usuário de teste
    testUser = await User.create({
      name: 'Usuário Teste',
      email: 'teste@carlimmirao.com',
      password: 'senhateste123',
      role: 'USER',
      status: 'ACTIVE'
    });
  });

  afterAll(async () => {
    // Limpar banco de dados após os testes
    await sequelize.drop();
    await sequelize.close();
  });

  it('Deve fazer login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@carlimmirao.com',
        password: 'senhateste123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'teste@carlimmirao.com');
  });

  it('Deve rejeitar login com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@carlimmirao.com',
        password: 'senhaincorreta'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
  });

  it('Deve rejeitar login de usuário inativo', async () => {
    // Criar usuário inativo
    const inactiveUser = await User.create({
      name: 'Usuário Inativo',
      email: 'inativo@carlimmirao.com',
      password: 'senhateste123',
      role: 'USER',
      status: 'INACTIVE'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'inativo@carlimmirao.com',
        password: 'senhateste123'
      });

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('message', 'Conta de usuário inativa');
  });
});
