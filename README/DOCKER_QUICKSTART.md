# Docker Quick Start Guide

## Installation

### 1. Install Docker

**Windows/Mac**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux**: 
```bash
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Verify Installation

```bash
docker --version
docker-compose --version
```

## Quick Setup (5 minutes)

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Build Containers
```bash
# On Windows (PowerShell)
.\docker-build.ps1 build-all

# On macOS/Linux
./docker-build.sh build-all

# Or use docker-compose directly
docker-compose build
```

### Step 3: Start Services
```bash
# On Windows (PowerShell)
.\docker-build.ps1 start

# On macOS/Linux
./docker-build.sh start

# Or use docker-compose directly
docker-compose up -d
```

### Step 4: Access Your Application

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Database**: localhost:5432

## Common Commands

### Using PowerShell Scripts (Windows)
```powershell
# View help
.\docker-build.ps1 help

# Start services
.\docker-build.ps1 start

# View logs
.\docker-build.ps1 logs

# Stop services
.\docker-build.ps1 stop

# Add sample data
.\docker-build.ps1 add-sample

# Create admin user
.\docker-build.ps1 create-user
```

### Using Bash Scripts (macOS/Linux)
```bash
# View help
./docker-build.sh help

# Start services
./docker-build.sh start

# View logs
./docker-build.sh logs

# Stop services
./docker-build.sh stop

# Add sample data
./docker-build.sh add-sample

# Create admin user
./docker-build.sh create-user
```

### Using docker-compose directly
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## What Gets Created

### Containers
- **profile_db**: PostgreSQL database
- **profile_backend**: Django REST API (Gunicorn)
- **profile_frontend**: React frontend (Nginx)
- **profile_nginx**: Nginx reverse proxy

### Volumes
- **postgres_data**: Database persistence
- **static_volume**: Static files
- **media_volume**: User uploads

### Networks
- **app-network**: Internal Docker network

## File Structure

```
project/
├── docker-compose.yml           # Container orchestration
├── docker-build.sh              # Bash helper script
├── docker-build.ps1             # PowerShell helper script
├── .env.example                 # Environment template
├── DOCKER_GUIDE.md              # Detailed guide
│
├── backend/
│   ├── Dockerfile              # Backend image definition
│   ├── .dockerignore           # Files to exclude
│   ├── requirements.txt         # Python dependencies
│   └── ...
│
└── frontend/
    ├── Dockerfile              # Frontend image definition
    ├── .dockerignore           # Files to exclude
    ├── package.json            # NPM dependencies
    └── ...
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 8000
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000

# Change ports in .env or docker-compose.yml
```

### Database Connection Failed
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Build Fails
```bash
# Clean and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### View Detailed Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

## Development Workflow

### Making Code Changes

**Backend changes**: Automatically reloaded (volume mount)
```bash
# Just save your Python files
# Changes are reflected immediately
```

**Frontend changes**: Automatically reloaded with npm
```bash
# Just save your JavaScript files
# React Dev Server will hot-reload
```

### Running Django Commands
```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Shell
docker-compose exec backend python manage.py shell

# Add sample data
docker-compose exec backend python manage.py add_sample_discussions
```

## Production Deployment

### 1. Update Environment
```bash
# Edit .env for production
DEBUG=False
SECRET_KEY=<secure-random-string>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
```

### 2. Build Images
```bash
docker-compose build
```

### 3. Deploy
```bash
docker-compose up -d
```

### 4. Monitor
```bash
docker-compose ps
docker-compose logs -f
```

## Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [React Deployment Guide](https://create-react-app.dev/deployment/)

## Need Help?

1. Check logs: `docker-compose logs -f`
2. Check status: `docker-compose ps`
3. Review DOCKER_GUIDE.md for detailed commands
4. Ensure .env file is configured correctly
5. Verify Docker is running: `docker ps`

## Next Steps

- [ ] Configure SSL/HTTPS
- [ ] Set up automated backups
- [ ] Configure email settings
- [ ] Set up monitoring and alerts
- [ ] Create CI/CD pipeline
