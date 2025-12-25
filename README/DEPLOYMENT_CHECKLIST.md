# Production Deployment Checklist

Before deploying to production, ensure you've completed all items on this checklist.

## 🔒 Security

### Environment Configuration
- [ ] Generate a strong `SECRET_KEY` (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- [ ] Set `DEBUG=False` in `.env`
- [ ] Set `ALLOWED_HOSTS` to your production domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend domain only
- [ ] Update database credentials (not default postgres/postgres)
- [ ] Set strong database password
- [ ] Store `.env` file securely (not in version control)

### Django Security
- [ ] Run `python manage.py check --deploy`
- [ ] Enable CSRF protection
- [ ] Enable security headers in Nginx
- [ ] Set `SECURE_SSL_REDIRECT=True` if using HTTPS
- [ ] Set `SESSION_COOKIE_SECURE=True`
- [ ] Set `CSRF_COOKIE_SECURE=True`
- [ ] Set appropriate `SECURE_HSTS_SECONDS`

### Docker Security
- [ ] Use non-root user in Dockerfile ✅ (already done)
- [ ] Don't commit sensitive data to Docker image
- [ ] Use `.dockerignore` ✅ (already done)
- [ ] Scan images for vulnerabilities: `docker scan image-name`

## 🌐 Domain & SSL/HTTPS

### DNS Configuration
- [ ] Update DNS records to point to your server
- [ ] Set up both `example.com` and `www.example.com`
- [ ] Wait for DNS propagation (up to 48 hours)

### SSL Certificate
- [ ] Obtain SSL certificate (Let's Encrypt recommended)
- [ ] Update Nginx configuration with certificate paths
- [ ] Enable HTTPS redirect in Nginx
- [ ] Test SSL configuration: `ssl-test.ssllabs.com`

### Example Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📦 Database Preparation

### PostgreSQL Setup
- [ ] Create production database
- [ ] Create dedicated database user (not superuser)
- [ ] Set restrictive permissions
- [ ] Enable backup user

### Migrations
- [ ] Run all migrations: `docker-compose exec backend python manage.py migrate`
- [ ] Verify database schema
- [ ] Check for pending migrations: `python manage.py showmigrations`

### Initial Data
- [ ] Create superuser account
- [ ] Add essential data (if needed)
- [ ] Verify data integrity

### Backup Strategy
- [ ] Set up automated daily backups
- [ ] Test backup restoration
- [ ] Store backups in separate location
- [ ] Implement backup rotation policy

## 📊 Performance & Monitoring

### Performance Optimization
- [ ] Enable caching in Django
- [ ] Configure static file serving via Nginx
- [ ] Set up CDN for media files (optional)
- [ ] Enable gzip compression in Nginx
- [ ] Optimize database queries
- [ ] Set appropriate Gunicorn worker count

### Monitoring Setup
- [ ] Set up server monitoring (CPU, memory, disk)
- [ ] Configure container health checks
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable application logging
- [ ] Configure log rotation
- [ ] Set up uptime monitoring

### Logging Configuration
```dockerfile
# Update docker-compose.yml with logging
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔄 Continuous Integration/Deployment

### Git Setup
- [ ] Create production branch
- [ ] Set up branch protection rules
- [ ] Configure webhook for auto-deploy
- [ ] Document deployment process

### Automated Testing
- [ ] Run Django tests: `python manage.py test`
- [ ] Run linters: `pylint`, `flake8`, `black`
- [ ] Run security checks: `bandit`
- [ ] Test API endpoints

### Deployment Automation
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Automate Docker image builds
- [ ] Automate image push to registry
- [ ] Automate container deployment

## 📝 Documentation

### Deployment Documentation
- [ ] Document deployment steps
- [ ] Document rollback procedures
- [ ] Document emergency contacts
- [ ] Document monitoring dashboard URLs
- [ ] Document backup/restore procedures

### API Documentation
- [ ] Document API endpoints
- [ ] Document authentication flow
- [ ] Document rate limiting
- [ ] Generate API documentation (optional)

## 🧪 Testing & Validation

### Functional Testing
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test community access (authentication required)
- [ ] Test all API endpoints
- [ ] Test file uploads
- [ ] Test email notifications

### Performance Testing
- [ ] Load testing with `locust` or `ab`
- [ ] Database query performance testing
- [ ] Frontend performance testing
- [ ] API response time monitoring

### Security Testing
- [ ] Test CSRF protection
- [ ] Test authentication bypass attempts
- [ ] Test SQL injection vulnerability
- [ ] Test XSS vulnerability
- [ ] Test rate limiting

## 📋 Infrastructure

### Server Setup
- [ ] Install Docker and Docker Compose
- [ ] Install system monitoring tools
- [ ] Configure firewall rules
- [ ] Set up SSH keys for deployments
- [ ] Configure automatic security updates

### Firewall Rules
```bash
# Allow SSH (22)
ufw allow 22

# Allow HTTP (80)
ufw allow 80

# Allow HTTPS (443)
ufw allow 443

# Enable firewall
ufw enable
```

### Backup Configuration
```bash
# Automated daily backup script
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## 👥 Team & Communication

### Team Access
- [ ] Create production deployment procedures
- [ ] Document team member roles
- [ ] Set up deployment approvals
- [ ] Create incident response plan

### Communication
- [ ] Notify users about launch
- [ ] Set up status page
- [ ] Create support contact information
- [ ] Set up issue tracking

## ✅ Pre-Launch Verification

### Final Checks (48 hours before launch)
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Load testing successful
- [ ] Database backup tested
- [ ] Monitoring configured and working
- [ ] Documentation updated
- [ ] Team trained on deployment

### Launch Day
- [ ] Team on standby
- [ ] Monitoring dashboard open
- [ ] Backup created
- [ ] Deployment approved by lead
- [ ] Rollback plan ready
- [ ] Announcement prepared

### Post-Launch (24 hours after)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify user registrations
- [ ] Check database performance
- [ ] Review logs for issues
- [ ] Confirm backups working

## 🆘 Emergency Procedures

### If Deployment Fails
1. [ ] Stop accepting traffic (optional)
2. [ ] Identify issue in logs
3. [ ] Roll back to previous version
4. [ ] Notify team
5. [ ] Fix issue
6. [ ] Re-deploy

### If Site Goes Down
1. [ ] Check monitoring alerts
2. [ ] Check server status
3. [ ] Check Docker containers: `docker-compose ps`
4. [ ] Check logs: `docker-compose logs`
5. [ ] Restart containers: `docker-compose restart`
6. [ ] Check database connection
7. [ ] Escalate if needed

### Rollback Procedure
```bash
# Stop current deployment
docker-compose down

# Switch to previous version
git checkout <previous-commit>

# Rebuild and restart
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs
```

## 📞 Support Contacts

- **Lead Developer**: [Name] - [Contact]
- **DevOps Engineer**: [Name] - [Contact]
- **Database Admin**: [Name] - [Contact]
- **On-Call**: [Rotation Schedule]

## 📚 Related Documentation

- `README.md` - Project overview
- `DOCKER_GUIDE.md` - Docker commands reference
- `DOCKER_QUICKSTART.md` - Quick start guide
- `API_DOCUMENTATION.md` - API endpoints
- `ARCHITECTURE.md` - System architecture

---

**Last Updated**: [Date]
**Next Review**: [Date + 30 days]
**Deployment Version**: [Version Number]

✅ **Remember**: Never skip security steps. When in doubt, ask for review!
