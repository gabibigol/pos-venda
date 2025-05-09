# Base da imagem
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    git \
    openssh \
    postgresql-client

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências de produção
RUN npm install --omit=dev

# Copiar código fonte
COPY . .

# Instalar dependências de desenvolvimento para scripts
RUN npm install --only=dev

# Criar diretório de logs
RUN mkdir -p logs

# Copiar .env.example como .env se não existir .env
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expor porta do aplicativo
EXPOSE 3000

# Definir variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Adicionar wait-for-postgres script
COPY wait-for-postgres.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-postgres.sh

# Definir permissões
RUN chown -R node:node /app
USER node

# Comando para iniciar a aplicação
CMD ["npm", "start"]