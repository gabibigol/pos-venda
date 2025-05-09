# Guia de Deploy - Carlim Mirão

## Requisitos Mínimos
- Sistema Operacional: Ubuntu 20.04+ LTS
- Memória RAM: 2GB
- CPU: 2 núcleos
- Espaço em disco: 10GB

## Preparação do Servidor

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Dependências
```bash
# Instalar Docker
sudo apt-get install ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configurar Docker para iniciar com o sistema
sudo systemctl enable docker
sudo systemctl start docker

# Adicionar usuário ao grupo docker (opcional)
sudo usermod -aG docker $USER
```

### 3. Configurar Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Aplicação Node.js
sudo ufw enable
```

## Deploy da Aplicação

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/carlim-mirao.git
cd carlim-mirao
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar .env.example para .env
cp backend/.env.example backend/.env

# Editar variáveis sensíveis
nano backend/.env
```

#### Variáveis Críticas a Configurar
- `JWT_SECRET`: Gere uma chave segura
- `DB_PASS`: Senha forte do banco de dados
- `NODE_ENV`: Definir como `production`

### 3. Gerar Chave Secreta Segura
```bash
# Gerar chave JWT segura
openssl rand -base64 32
```

### 4. Iniciar Aplicação
```bash
# Construir e iniciar com Docker Compose
docker-compose up -d --build

# Verificar logs
docker-compose logs -f backend
```

## Configurações Adicionais

### Backup de Banco de Dados
```bash
# Script de backup (salvar em /backup/postgres-backup.sh)
#!/bin/bash
BACKUP_DIR="/var/backups/carlim-mirao"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/postgres_backup_${TIMESTAMP}.sql"

mkdir -p $BACKUP_DIR

docker exec postgres pg_dump -U carlim_user carlim_mirao_db > $BACKUP_FILE
```

### Rotação de Logs
```bash
# Configurar logrotate (/etc/logrotate.d/carlim-mirao)
/var/log/carlim-mirao/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

## Monitoramento

### Docker Stats
```bash
# Monitorar recursos dos containers
docker stats
```

### Logs da Aplicação
```bash
# Ver logs em tempo real
docker-compose logs -f backend
```

## Atualização da Aplicação
```bash
# Pull das últimas mudanças
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting
- Verificar portas: `sudo lsof -i :3000`
- Reiniciar Docker: `sudo systemctl restart docker`
- Limpar containers antigos: `docker system prune -a`

## Segurança Adicional

### Fail2Ban (Proteção contra força bruta)
```bash
sudo apt-get install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
# Configurar regras para SSH, HTTP, etc.
```

### Certificado SSL com Let's Encrypt
```bash
# Usando Certbot
sudo snap install --classic certbot
sudo certbot --nginx
```

## Considerações Finais
- Mantenha o sistema operacional e dependências atualizadas
- Faça backups regulares
- Monitore logs e desempenho
- Revise configurações de segurança periodicamente