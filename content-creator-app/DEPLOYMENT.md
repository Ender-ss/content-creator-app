# Guia de Deployment - Content Creator

Este guia explica como fazer o deploy do aplicativo Content Creator em produção.

## 🚀 Opções de Deployment

### 1. Deploy Usando Manus (Recomendado)

O Manus oferece deployment automático para aplicações Flask full-stack.

#### Preparação
```bash
# 1. Build do frontend
cd frontend
pnpm run build

# 2. Copiar build para o backend
cp -r dist/* ../backend/src/static/

# 3. Atualizar requirements.txt
cd ../backend
source venv/bin/activate
pip freeze > requirements.txt
```

#### Deploy
```bash
# No diretório backend
manus deploy backend --type flask
```

### 2. Deploy Manual em VPS

#### Pré-requisitos
- Ubuntu 20.04+ ou similar
- Python 3.11+
- Node.js 20+
- Nginx
- PM2 (opcional)

#### Configuração do Servidor

```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências
sudo apt install python3.11 python3.11-venv python3-pip nginx -y

# 3. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# 4. Instalar pnpm
npm install -g pnpm
```

#### Deploy da Aplicação

```bash
# 1. Clonar repositório
git clone <your-repo> /var/www/content-creator
cd /var/www/content-creator

# 2. Configurar backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Build frontend
cd ../frontend
pnpm install
pnpm run build

# 4. Copiar build para backend
cp -r dist/* ../backend/src/static/

# 5. Configurar permissões
sudo chown -R www-data:www-data /var/www/content-creator
sudo chmod -R 755 /var/www/content-creator
```

#### Configuração do Nginx

```nginx
# /etc/nginx/sites-available/content-creator
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/content-creator/backend/src/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/content-creator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Configuração do Systemd

```ini
# /etc/systemd/system/content-creator.service
[Unit]
Description=Content Creator Flask App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/content-creator/backend
Environment=PATH=/var/www/content-creator/backend/venv/bin
ExecStart=/var/www/content-creator/backend/venv/bin/python src/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable content-creator
sudo systemctl start content-creator
sudo systemctl status content-creator
```

### 3. Deploy com Docker

#### Dockerfile Backend
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY static/ ./src/static/

EXPOSE 5000

CMD ["python", "src/main.py"]
```

#### Dockerfile Frontend (Build)
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend/src/database:/app/src/database
    environment:
      - FLASK_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
```

## 🔧 Configurações de Produção

### Variáveis de Ambiente

```bash
# .env (backend)
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///app.db
CORS_ORIGINS=https://your-domain.com
```

### Configuração de Segurança

```python
# backend/src/config.py
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'fallback-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = False
    TESTING = False
```

### SSL/HTTPS

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d your-domain.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento

### Logs

```bash
# Logs do systemd
sudo journalctl -u content-creator -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/content-creator"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
cp /var/www/content-creator/backend/src/database/app.db $BACKUP_DIR/app_$DATE.db

# Backup dos arquivos de configuração
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /var/www/content-creator/backend/src/

# Limpar backups antigos (manter apenas 7 dias)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro 502 Bad Gateway
```bash
# Verificar se o serviço está rodando
sudo systemctl status content-creator

# Verificar logs
sudo journalctl -u content-creator -n 50
```

#### 2. Erro de Permissões
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/www/content-creator
sudo chmod -R 755 /var/www/content-creator
```

#### 3. Erro de Banco de Dados
```bash
# Recriar banco
cd /var/www/content-creator/backend
source venv/bin/activate
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

### Monitoramento de Performance

```bash
# Instalar htop
sudo apt install htop -y

# Monitorar recursos
htop

# Verificar uso de disco
df -h

# Verificar logs de erro
sudo tail -f /var/log/nginx/error.log
```

## 📈 Otimizações

### 1. Cache
- Configure cache do Nginx para arquivos estáticos
- Implemente cache Redis para dados da API
- Use CDN para assets

### 2. Compressão
```nginx
# Adicionar ao nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
```

### 3. Banco de Dados
- Para produção, considere PostgreSQL
- Configure backup automático
- Monitore performance das queries

## 🔐 Segurança

### 1. Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

### 2. Fail2Ban
```bash
# Instalar e configurar
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Atualizações
```bash
# Configurar atualizações automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

**Para suporte adicional, consulte a documentação oficial das ferramentas utilizadas.**

