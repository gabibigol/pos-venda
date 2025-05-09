#!/bin/bash

# Carregar variáveis de ambiente de teste
export $(cat .env.test | xargs)

# Executar migrações de banco de dados
npx sequelize-cli db:migrate --env test

# Opcional: Seed inicial para testes
# npx sequelize-cli db:seed:all --env test

echo "Banco de dados de teste inicializado com sucesso!"