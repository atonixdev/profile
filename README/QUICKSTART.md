# Quick Start Guide

## Development Setup (Windows PowerShell)

### 1. Backend Setup
```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Generate a secret key (run in Python)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy the output and paste it in .env as SECRET_KEY

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (follow prompts)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend will run at: http://localhost:8000

### 2. Frontend Setup (New PowerShell Window)
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start frontend server
npm start
```

Frontend will run at: http://localhost:3000

### 3. Initial Data Setup

1. Visit http://localhost:8000/admin
2. Login with your superuser credentials
3. Create a Profile entry with your information
4. Add some sample:
   - Projects (Portfolio)
   - Services
   - Testimonials

### 4. Test the Application

**Public Site:**
- Visit http://localhost:3000
- Navigate through all pages
- Submit a test inquiry via Contact page

**Admin Panel:**
- Visit http://localhost:3000/admin/login
- Login with superuser credentials
- View dashboard and manage content

## Using Docker (Alternative)

```powershell
# Build and start all services
docker-compose up --build

# In another terminal, create superuser
docker-compose exec backend python manage.py createsuperuser

# Stop services
docker-compose down
```

## Production Deployment Checklist

### Backend
- [ ] Set DEBUG=False
- [ ] Generate strong SECRET_KEY
- [ ] Configure PostgreSQL database
- [ ] Set ALLOWED_HOSTS
- [ ] Configure CORS_ALLOWED_ORIGINS
- [ ] Set up media file storage (AWS S3/similar)
- [ ] Enable HTTPS
- [ ] Configure email backend for notifications

### Frontend
- [ ] Update REACT_APP_API_URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to Netlify/Vercel
- [ ] Configure custom domain
- [ ] Enable HTTPS

## Common Commands

### Backend
```powershell
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run development server
python manage.py runserver

# Django shell
python manage.py shell
```

### Frontend
```powershell
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-generated-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Virtual Environment Issues
```powershell
# If activation script fails, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CORS Errors
- Ensure backend CORS_ALLOWED_ORIGINS includes frontend URL
- Check that frontend is making requests to correct API URL

### Database Errors
```powershell
# Reset database (CAUTION: Deletes all data)
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## Next Steps

1. Customize the color scheme in `frontend/tailwind.config.js`
2. Add your personal content through Django admin
3. Upload your profile photo and project images
4. Test the contact form
5. Deploy to production when ready

## Support

For detailed documentation, see README.md
For API documentation, visit http://localhost:8000/api/ when backend is running
