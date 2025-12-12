# Production Deployment Guide for atonixdev.org

## Overview
This guide covers deploying the atonixdev personal brand website with:
- Frontend: https://atonixdev.org
- Backend API: https://api.atonixdev.org

## Prerequisites
- Ubuntu 20.04+ server
- Domain names: atonixdev.org and api.atonixdev.org
- SSL certificates (Let's Encrypt recommended)
- PostgreSQL database
- Docker and Docker Compose

## 1. Server Setup

### Update system and install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### Configure PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE personal_brand_hub_prod;
CREATE USER prod_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE personal_brand_hub_prod TO prod_user;
\q
```

## 2. Domain and SSL Setup

### Configure DNS
Point these domains to your server IP:
- atonixdev.org → A record to server IP
- api.atonixdev.org → A record to server IP
- www.atonixdev.org → CNAME to atonixdev.org

### Get SSL certificates
```bash
sudo certbot --nginx -d atonixdev.org -d www.atonixdev.org
sudo certbot --nginx -d api.atonixdev.org
```

## 3. Application Deployment

### Clone and configure
```bash
git clone https://github.com/yourusername/profile.git
cd profile
cp .env.production .env
```

### Edit .env file
Update the following in `.env`:
```bash
SECRET_KEY=your-production-secret-key-here
DB_PASSWORD=your-production-db-password
```

### Build and deploy
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run database migrations
docker-compose -f docker-compose.yml run --rm backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.yml run --rm backend python manage.py collectstatic --noinput

# Start services
docker-compose -f docker-compose.yml up -d
```

## 4. Nginx Configuration

### Copy production nginx config
```bash
sudo cp nginx.production.conf /etc/nginx/sites-available/atonixdev.org
sudo ln -s /etc/nginx/sites-available/atonixdev.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Update nginx config with actual SSL paths
Edit `/etc/nginx/sites-available/atonixdev.org` and update SSL certificate paths based on certbot output.

## 5. Static Files Setup

### Create directories
```bash
sudo mkdir -p /var/www/atonixdev.org/html
sudo mkdir -p /var/www/api.atonixdev.org/{static,media}
sudo chown -R www-data:www-data /var/www/
```

### Copy built frontend
```bash
# From your local machine, build and copy frontend
cd frontend
npm run build
scp -r build/* user@server:/var/www/atonixdev.org/html/
```

### Copy backend static files
```bash
# From docker container
docker cp profile_backend_1:/app/staticfiles /var/www/api.atonixdev.org/static/
```

## 6. Security Hardening

### Configure firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### Set up monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop ncdu fail2ban

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 7. Backup Strategy

### Database backup script
```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U prod_user -h localhost personal_brand_hub_prod > /backups/db_backup_$DATE.sql
find /backups -name "db_backup_*.sql" -mtime +7 -delete
```

### Media files backup
```bash
#!/bin/bash
# /usr/local/bin/backup-media.sh
rsync -av /var/www/api.atonixdev.org/media/ /backups/media/
```

## 8. Monitoring and Maintenance

### Set up log rotation
```bash
sudo nano /etc/logrotate.d/atonixdev
/var/log/atonixdev/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### Health checks
Add to crontab:
```bash
*/5 * * * * curl -f https://api.atonixdev.org/api/health/ || echo "API down" | mail -s "API Alert" admin@atonixdev.org
```

## 9. Performance Optimization

### Enable gzip compression
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Database optimization
```sql
-- Run these in PostgreSQL
CREATE INDEX CONCURRENTLY idx_blog_posts_published ON blog_post(published_at) WHERE status = 'published';
CREATE INDEX CONCURRENTLY idx_portfolio_featured ON portfolio_project(is_featured) WHERE is_featured = true;
```

## 10. Troubleshooting

### Common Issues

**CORS errors:**
- Check CORS_ALLOWED_ORIGINS in .env
- Verify nginx proxy headers

**Static files not loading:**
- Run `python manage.py collectstatic`
- Check nginx static file configuration

**Database connection issues:**
- Verify DATABASE_URL in .env
- Check PostgreSQL service status

**SSL certificate issues:**
- Run `certbot renew`
- Check certificate paths in nginx config

## 11. Update Process

### For application updates:
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec backend python manage.py migrate
```

### For SSL renewal:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 12. Security Checklist

- [ ] DEBUG=False in production
- [ ] SECRET_KEY is strong and unique
- [ ] Database password is secure
- [ ] SSL certificates are valid
- [ ] Firewall is configured
- [ ] Regular backups are scheduled
- [ ] Log files are monitored
- [ ] Dependencies are kept updated
- [ ] Admin URL is not publicly accessible
- [ ] API rate limiting is configured