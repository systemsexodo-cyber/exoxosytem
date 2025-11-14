# Guia de Deploy em VPS

Este documento descreve como fazer o deploy do Sistema de Gestão de Pedidos em uma VPS (Virtual Private Server) na nuvem.

## Pré-requisitos

### Na VPS

1. **Sistema Operacional**: Ubuntu 22.04 LTS ou superior
2. **Node.js**: Versão 18.x ou superior
3. **PostgreSQL**: Versão 14 ou superior (ou MySQL/MariaDB compatível)
4. **Nginx**: Para proxy reverso
5. **PM2**: Para gerenciamento de processos Node.js
6. **Certificado SSL**: Let's Encrypt (recomendado)

### Instalação de Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar pnpm
sudo npm install -g pnpm
```

## Configuração do Banco de Dados

### PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco de dados e usuário
CREATE DATABASE gestao_pedidos;
CREATE USER gestao_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE gestao_pedidos TO gestao_user;
\q
```

### String de Conexão

A string de conexão do PostgreSQL deve seguir o formato:
```
postgresql://gestao_user:sua_senha_segura@localhost:5432/gestao_pedidos
```

Para MySQL/MariaDB:
```
mysql://gestao_user:sua_senha_segura@localhost:3306/gestao_pedidos
```

## Deploy da Aplicação

### 1. Clonar ou Transferir o Projeto

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Transferir arquivos do projeto (via git, scp, rsync, etc.)
# Exemplo com git:
git clone seu-repositorio.git sistema-gestao-pedidos
cd sistema-gestao-pedidos
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Adicione as seguintes variáveis (ajuste conforme necessário):

```env
# Banco de Dados
DATABASE_URL=postgresql://gestao_user:sua_senha_segura@localhost:5432/gestao_pedidos

# JWT Secret (gere uma chave aleatória segura)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui

# OAuth (se estiver usando Manus OAuth, mantenha as variáveis fornecidas)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# Aplicação
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Sistema de Gestão de Pedidos
```

### 3. Instalar Dependências e Build

```bash
# Instalar dependências
pnpm install

# Aplicar migrações do banco de dados
pnpm db:push

# (Opcional) Popular banco com dados de exemplo
pnpm exec tsx seed-db.mjs

# Build do frontend
pnpm build
```

### 4. Configurar PM2

```bash
# Iniciar aplicação com PM2
pm2 start server/_core/index.ts --name gestao-pedidos --interpreter tsx

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs gestao-pedidos
```

### 5. Configurar Nginx

Crie um arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/gestao-pedidos
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (configurar com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/gestao-pedidos-access.log;
    error_log /var/log/nginx/gestao-pedidos-error.log;

    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Tamanho máximo de upload
    client_max_body_size 50M;
}
```

Ativar o site e reiniciar Nginx:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/gestao-pedidos /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 6. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática já está configurada
# Testar renovação:
sudo certbot renew --dry-run
```

## Firewall

Configure o firewall para permitir tráfego HTTP/HTTPS:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

## Manutenção

### Atualizar Aplicação

```bash
cd /var/www/sistema-gestao-pedidos

# Baixar atualizações
git pull origin main

# Instalar novas dependências
pnpm install

# Aplicar migrações
pnpm db:push

# Rebuild
pnpm build

# Reiniciar aplicação
pm2 restart gestao-pedidos
```

### Monitoramento

```bash
# Ver logs em tempo real
pm2 logs gestao-pedidos

# Monitorar recursos
pm2 monit

# Ver status
pm2 status
```

### Backup do Banco de Dados

```bash
# Backup PostgreSQL
pg_dump -U gestao_user -h localhost gestao_pedidos > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U gestao_user -h localhost gestao_pedidos < backup_20240101.sql
```

## Segurança

1. **Firewall**: Configure UFW para permitir apenas portas necessárias
2. **SSH**: Desabilite login root, use chaves SSH
3. **Atualizações**: Mantenha sistema e dependências atualizados
4. **Backup**: Configure backups automáticos do banco de dados
5. **Monitoramento**: Configure alertas para falhas da aplicação
6. **Senhas**: Use senhas fortes e únicas para banco de dados
7. **Variáveis de Ambiente**: Nunca commite arquivos `.env` no git

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs gestao-pedidos

# Verificar se porta 3000 está em uso
sudo lsof -i :3000

# Reiniciar aplicação
pm2 restart gestao-pedidos
```

### Erro de conexão com banco de dados

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U gestao_user -h localhost -d gestao_pedidos
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/gestao-pedidos-error.log
```

## Recursos Adicionais

- [Documentação PM2](https://pm2.keymetrics.io/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)
