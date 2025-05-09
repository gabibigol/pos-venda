require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rotas de exemplo
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao Carlim Mirão Backend',
    status: 'Online'
  });
});

// Conexão com banco de dados
sequelize.authenticate()
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Conexão com banco de dados estabelecida');
      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
      });
    }
  })
  .catch(err => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Erro ao conectar ao banco de dados:', err);
    }
  });

module.exports = app;
