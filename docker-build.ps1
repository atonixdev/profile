# Docker Build and Deployment Script for Windows
# Usage: .\docker-build.ps1 [command]

param(
    [string]$Command = "help"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Yellow"

function Print-Header {
    param([string]$Message)
    Write-Host "========================================" -ForegroundColor $SuccessColor
    Write-Host $Message -ForegroundColor $SuccessColor
    Write-Host "========================================" -ForegroundColor $SuccessColor
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ Error: $Message" -ForegroundColor $ErrorColor
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

# Check if docker is installed
function Check-Docker {
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        Print-Error "Docker is not installed. Please install Docker Desktop."
        exit 1
    }
    Print-Success "Docker is installed"
}

function Check-DockerCompose {
    $compose = Get-Command docker-compose -ErrorAction SilentlyContinue
    if (-not $compose) {
        Print-Error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    }
    Print-Success "Docker Compose is installed"
}

# Build functions
function Build-All {
    Print-Header "Building all services"
    docker-compose build
    Print-Success "All services built successfully"
}

function Build-Backend {
    Print-Header "Building backend service"
    docker-compose build backend
    Print-Success "Backend built successfully"
}

function Build-Frontend {
    Print-Header "Building frontend service"
    docker-compose build frontend
    Print-Success "Frontend built successfully"
}

# Start functions
function Start-All {
    Print-Header "Starting all services"
    docker-compose up -d
    Print-Success "All services started"
    Print-Info "Backend: http://localhost:8000"
    Print-Info "Frontend: http://localhost:3000"
    Print-Info "Database: localhost:5432"
}

function Start-Development {
    Print-Header "Starting in development mode"
    docker-compose up
}

function Stop-All {
    Print-Header "Stopping all services"
    docker-compose down
    Print-Success "All services stopped"
}

function Restart-All {
    Print-Header "Restarting all services"
    docker-compose restart
    Print-Success "All services restarted"
}

# Log functions
function Show-Logs {
    Print-Header "Showing logs for all services"
    docker-compose logs -f
}

function Show-LogsBackend {
    Print-Header "Showing logs for backend"
    docker-compose logs -f backend
}

function Show-LogsFrontend {
    Print-Header "Showing logs for frontend"
    docker-compose logs -f frontend
}

function Show-LogsDb {
    Print-Header "Showing logs for database"
    docker-compose logs -f db
}

# Database functions
function Invoke-Migrate {
    Print-Header "Running database migrations"
    docker-compose exec backend python manage.py migrate
    Print-Success "Migrations completed"
}

function Add-SampleData {
    Print-Header "Adding sample data"
    docker-compose exec backend python manage.py add_sample_discussions
    Print-Success "Sample data added"
}

function Create-Superuser {
    Print-Header "Creating superuser"
    docker-compose exec backend python manage.py createsuperuser
}

function Backup-Database {
    Print-Header "Backing up database"
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "backup_${Timestamp}.sql"
    docker-compose exec db pg_dump -U postgres personal_brand_hub > $BackupFile
    Print-Success "Database backed up to $BackupFile"
}

# Status functions
function Show-Status {
    Print-Header "Container Status"
    docker-compose ps
}

function Show-Stats {
    Print-Header "Container Statistics"
    docker stats
}

# Clean functions
function Clean-All {
    Print-Header "Cleaning up all Docker resources"
    $confirm = Read-Host "This will remove all containers, volumes, and networks. Are you sure? (y/n)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker-compose down -v
        Print-Success "Cleanup completed"
    } else {
        Print-Info "Cleanup cancelled"
    }
}

function Prune-System {
    Print-Header "Pruning unused Docker resources"
    docker system prune -f
    Print-Success "Prune completed"
}

# Help function
function Show-Help {
    Write-Host @"
Docker Build and Deployment Script for Windows

Usage: .\docker-build.ps1 [command]

Commands:
  build-all              Build all services
  build-backend          Build backend service
  build-frontend         Build frontend service
  start                  Start all services in background
  start-dev              Start all services with logs in foreground
  stop                   Stop all services
  restart                Restart all services
  status                 Show container status
  logs                   Show logs for all services
  logs-backend           Show logs for backend
  logs-frontend          Show logs for frontend
  logs-db                Show logs for database
  migrate                Run database migrations
  add-sample             Add sample data to database
  create-user            Create a superuser
  backup                 Backup database
  stats                  Show container statistics
  clean                  Remove all containers and volumes
  prune                  Prune unused Docker resources
  help                   Show this help message
"@
}

# Main script
switch ($Command) {
    "build-all" {
        Check-Docker; Check-DockerCompose; Build-All
    }
    "build-backend" {
        Check-Docker; Check-DockerCompose; Build-Backend
    }
    "build-frontend" {
        Check-Docker; Check-DockerCompose; Build-Frontend
    }
    "start" {
        Check-Docker; Check-DockerCompose; Start-All
    }
    "start-dev" {
        Check-Docker; Check-DockerCompose; Start-Development
    }
    "stop" {
        Check-Docker; Check-DockerCompose; Stop-All
    }
    "restart" {
        Check-Docker; Check-DockerCompose; Restart-All
    }
    "status" {
        Check-Docker; Check-DockerCompose; Show-Status
    }
    "logs" {
        Check-Docker; Check-DockerCompose; Show-Logs
    }
    "logs-backend" {
        Check-Docker; Check-DockerCompose; Show-LogsBackend
    }
    "logs-frontend" {
        Check-Docker; Check-DockerCompose; Show-LogsFrontend
    }
    "logs-db" {
        Check-Docker; Check-DockerCompose; Show-LogsDb
    }
    "migrate" {
        Check-Docker; Check-DockerCompose; Invoke-Migrate
    }
    "add-sample" {
        Check-Docker; Check-DockerCompose; Add-SampleData
    }
    "create-user" {
        Check-Docker; Check-DockerCompose; Create-Superuser
    }
    "backup" {
        Check-Docker; Check-DockerCompose; Backup-Database
    }
    "stats" {
        Check-Docker; Check-DockerCompose; Show-Stats
    }
    "clean" {
        Check-Docker; Check-DockerCompose; Clean-All
    }
    "prune" {
        Check-Docker; Check-DockerCompose; Prune-System
    }
    "help" {
        Show-Help
    }
    default {
        Print-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}
