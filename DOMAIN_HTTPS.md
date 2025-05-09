# Configuração de Domínio e HTTPS - Carlim Mirão

## Opções de Domínio

### 1. Domínio Próprio
- Registrar domínio em provedor como Registro.br, GoDaddy
- Exemplo: `carlimmirao.com.br`

### 2. Subdomínio
- `api.carlimmirao.com.br`
- `backend.carlimmirao.com.br`

## Configuração de DNS

### Registro A
```
Tipo: A
Host: api ou backend
Aponta para: IP do Servidor
TTL: 3600
```

## Configuração Nginx como Proxy Reverso

### Instalação
```bash
sudo apt update
sudo apt install nginx
```

### Configuração Básica
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name api.carlimmirao.com.br;

    ssl_certificate /etc/letsencrypt/live/api.carlimmirao.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.carlimmirao.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Let's Encrypt (Certbot)

### Instalação
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Geração de Certificado
```bash
sudo certbot --nginx -d api.carlimmirao.com.br
```

## Configurações de Segurança HTTPS

### Cabeçalhos de Segurança
```nginx
# No bloco server do Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### Redirecionamento HTTP para HTTPS
```nginx
server {
    listen 80;
    server_name api.carlimmirao.com.br;
    return 301 https://$server_name$request_uri;
}
```

## Configurações Adicionais no Backend

### CORS e Segurança
```javascript
// No index.js ou configuração de CORS
app.use(cors({
  origin: 'https://api.carlimmirao.com.br',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Renovação Automática de Certificados
```bash
# Teste de renovação
sudo certbot renew --dry-run

# Renovação automática via crontab
sudo crontab -e

# Adicionar linha
0 0,12 * * * certbot renew --quiet
```

## Considerações Finais
- Sempre use HTTPS
- Mantenha certificados atualizados
- Configure redirecionamentos seguros
- Monitore expiração de certificados