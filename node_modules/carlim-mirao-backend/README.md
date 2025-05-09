# Carlim Mirão - Backend

## Descrição do Projeto
Backend para o sistema Carlim Mirão, desenvolvido com Node.js, Express e PostgreSQL.

## Pré-requisitos
- Node.js 20+
- PostgreSQL
- Docker (opcional)

## Configuração do Ambiente

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/carlim-mirao.git
cd carlim-mirao/backend
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
- Copie `.env.example` para `.env`
- Ajuste as configurações conforme necessário

## Scripts Disponíveis
- `npm start`: Inicia o servidor
- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm test`: Executa os testes
- `npm run lint`: Verifica o código em busca de erros

## Estrutura do Projeto
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## Variáveis de Ambiente
Consulte `.env.example` para todas as configurações necessárias.

## Contribuição
1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
[Inserir informações da licença]