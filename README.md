# Personal Brand Hub

A full-stack personal branding platform built with React and Django REST Framework.

## 🚀 Features

### Public Pages
- **Homepage** - Introduction and highlights with featured projects
- **About Me** - Background, skills, and story
- **Services** - List of offerings with pricing
- **Portfolio** - Showcase projects with filtering by category
- **Testimonials** - Client feedback and endorsements
- **Contact** - Inquiry form for potential clients

### Admin Portal
- Secure JWT authentication
- Dashboard with statistics
- CRUD management for:
  - Projects (with image uploads)
  - Services
  - Testimonials
  - Profile information
- Inquiry management system

## 🛠️ Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- SimpleJWT for authentication
- PostgreSQL/SQLite
- Pillow for image handling

### Frontend
- React 18
- React Router v6
- Axios for API calls
- TailwindCSS for styling
- Context API for state management

## 📦 Project Structure

```
profile/
├── backend/                 # Django backend
│   ├── config/             # Django project settings
│   ├── accounts/           # User profiles
│   ├── portfolio/          # Projects management
│   ├── services/           # Services management
│   ├── testimonials/       # Testimonials management
│   ├── contact/            # Inquiry/contact management
│   └── manage.py
│
└── frontend/               # React frontend
    ├── public/
    └── src/
        ├── components/     # Reusable components
        ├── pages/         # Page components
        ├── services/      # API service layer
        ├── context/       # React context
        └── App.js
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```powershell
cd backend
```

2. Create virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. Create `.env` file:
```powershell
cp .env.example .env
```

5. Update `.env` with your settings (generate a strong SECRET_KEY)

6. Run migrations:
```powershell
python manage.py makemigrations
python manage.py migrate
```

7. Create superuser:
```powershell
python manage.py createsuperuser
```

8. Run development server:
```powershell
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Create `.env` file:
```powershell
cp .env.example .env
```

4. Start development server:
```powershell
npm start
```

Frontend will be available at: http://localhost:3000

## 🔐 Admin Access

1. Visit http://localhost:8000/admin to access Django admin
2. Login with your superuser credentials
3. Create a Profile entry for your personal information
4. Add projects, services, and testimonials

For the React admin panel:
1. Visit http://localhost:3000/admin/login
2. Login with your superuser credentials
3. Manage content through the admin dashboard

## 📝 API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Profile
- `GET /api/accounts/profiles/public/` - Get public profile

### Projects
- `GET /api/portfolio/projects/` - List all projects
- `GET /api/portfolio/projects/{id}/` - Get project details
- `GET /api/portfolio/projects/featured/` - Get featured projects
- `POST /api/portfolio/projects/` - Create project (admin only)
- `PUT /api/portfolio/projects/{id}/` - Update project (admin only)
- `DELETE /api/portfolio/projects/{id}/` - Delete project (admin only)

### Services
- `GET /api/services/` - List all services
- `POST /api/services/` - Create service (admin only)
- `PUT /api/services/{id}/` - Update service (admin only)
- `DELETE /api/services/{id}/` - Delete service (admin only)

### Testimonials
- `GET /api/testimonials/` - List all testimonials
- `GET /api/testimonials/featured/` - Get featured testimonials
- `POST /api/testimonials/` - Create testimonial (admin only)
- `PUT /api/testimonials/{id}/` - Update testimonial (admin only)
- `DELETE /api/testimonials/{id}/` - Delete testimonial (admin only)

### Contact
- `POST /api/contact/inquiries/` - Submit inquiry (public)
- `GET /api/contact/inquiries/` - List inquiries (admin only)
- `PATCH /api/contact/inquiries/{id}/update_status/` - Update inquiry status (admin only)

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.js` to change the primary color scheme.

### Content
- Update your profile through Django admin
- Add projects, services, and testimonials
- Customize page content in React components

## 🚀 Deployment

### Backend (Django)

#### Option 1: Render/Railway
1. Create a new web service
2. Connect your repository
3. Set environment variables (SECRET_KEY, DATABASE_URL, etc.)
4. Deploy

#### Option 2: Docker
```powershell
cd backend
docker build -t brand-hub-backend .
docker run -p 8000:8000 brand-hub-backend
```

### Frontend (React)

#### Netlify/Vercel
1. Build the app:
```powershell
npm run build
```

2. Deploy the `build` folder to Netlify or Vercel

3. Set environment variable:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 🔒 Security Considerations

- Change SECRET_KEY in production
- Use PostgreSQL for production database
- Enable HTTPS
- Set appropriate CORS_ALLOWED_ORIGINS
- Use strong passwords for admin accounts
- Keep dependencies updated

## 📧 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DB_NAME=database_name
DB_USER=database_user
DB_PASSWORD=database_password
```

### Frontend (.env)
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## 🤝 Contributing

This is a personal project template. Feel free to fork and customize for your own use.

## 📄 License

MIT License - feel free to use this for your personal brand!

## 🆘 Troubleshooting

### CORS Errors
- Ensure backend CORS_ALLOWED_ORIGINS includes your frontend URL
- Check that django-cors-headers is installed and configured

### Authentication Issues
- Verify JWT tokens are being sent in Authorization header
- Check token expiration settings in backend/config/settings.py

### Image Upload Issues
- Ensure MEDIA_URL and MEDIA_ROOT are configured
- Check file upload permissions

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using React and Django
