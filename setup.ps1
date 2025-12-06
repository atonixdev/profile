# Setup script for Personal Brand Hub
# Run this in PowerShell from the project root directory

Write-Host "🚀 Personal Brand Hub - Automated Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Check if Python is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.9+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Backend setup
Set-Location backend

# Create virtual environment
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists, skipping creation..." -ForegroundColor Cyan
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (Test-Path ".env") {
    Write-Host ".env file already exists, skipping..." -ForegroundColor Cyan
} else {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    
    # Generate secret key
    Write-Host "Generating Django secret key..." -ForegroundColor Cyan
    $secretKey = python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    
    # Update .env file with secret key
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'SECRET_KEY=.*', "SECRET_KEY=$secretKey"
    $envContent | Set-Content .env
    
    Write-Host "✓ Secret key generated and added to .env" -ForegroundColor Green
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
python manage.py makemigrations
python manage.py migrate

# Create superuser
Write-Host ""
Write-Host "Creating superuser account..." -ForegroundColor Yellow
Write-Host "Please enter superuser details:" -ForegroundColor Cyan
python manage.py createsuperuser

Write-Host "✓ Backend setup complete!" -ForegroundColor Green

# Return to project root
Set-Location ..

Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

# Frontend setup
Set-Location frontend

# Install dependencies
Write-Host "Installing Node dependencies..." -ForegroundColor Cyan
npm install

# Create .env file
if (Test-Path ".env") {
    Write-Host ".env file already exists, skipping..." -ForegroundColor Cyan
} else {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
}

Write-Host "✓ Frontend setup complete!" -ForegroundColor Green

# Return to project root
Set-Location ..

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open TWO PowerShell windows" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Window 1 - Start Backend:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor White
Write-Host ""
Write-Host "   Window 2 - Start Frontend:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Access the applications:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "   - Django Admin: http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "3. Add your content:" -ForegroundColor Cyan
Write-Host "   - Login to Django Admin with your superuser account" -ForegroundColor White
Write-Host "   - Create a Profile entry with your information" -ForegroundColor White
Write-Host "   - Add projects, services, and testimonials" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
