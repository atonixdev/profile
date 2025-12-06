# Start script for Personal Brand Hub
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Personal Brand Hub..." -ForegroundColor Green
Write-Host ""

# Start backend in a new PowerShell window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend in a new PowerShell window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "- Django Admin: http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "Close the opened PowerShell windows to stop the servers." -ForegroundColor Yellow
