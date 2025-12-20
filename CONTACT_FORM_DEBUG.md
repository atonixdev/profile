# Contact Form Troubleshooting Guide
## Issues Fixed
### 1.  Frontend Not Sending Country Data
**Problem:** Country and country_code fields were not being sent to the backend
**Solution:** Updated `src/pages/Contact.js` to include country fields in the API request
### 2.  Incorrect Backend API URL
**Problem:** Frontend was pointing to `http://localhost:5000/api` instead of `http://localhost:8000/api`
**Solution:** Updated `src/services/api.js` to use correct backend port (8000)
## How to Check If Messages Are Being Received
### Check Backend Logs
```bash
# View Django logs from the running container
docker logs profile_backend -f
# Or tail the logs with more details
docker exec profile_backend tail -f /var/log/django.log 2>/dev/null || echo "No log file, check docker logs"
```
### Access Django Admin
1. Navigate to: `http://localhost:8000/admin/`
2. Login with your admin credentials
3. Go to Contact → Inquiries
4. You should see all submitted inquiries here
### Check Database Directly
```bash
# Access Django shell
docker exec -it profile_backend python manage.py shell
# Then run these commands:
from contact.models import Inquiry
Inquiry.objects.all()  # See all inquiries
Inquiry.objects.latest('created_at')  # See most recent
```
## Backend API Endpoints
### Submit Inquiry (POST)
```
POST /api/contact/inquiries/
Content-Type: application/json
{
"name": "John Doe",
"email": "john@example.com",
"phone": "+1234567890",
"country": "United States",
"country_code": "US",
"company": "Acme Corp",
"inquiry_type": "quote",
"subject": "Infrastructure Quote Request",
"message": "I need help with cloud architecture...",
"budget": "50k-100k"
}
```
**Response (Success):**
```json
{
"message": "Your inquiry has been submitted successfully!",
"id": 1
}
```
**Response (Error):**
```json
{
"field_name": ["Error message"]
}
```
## Common Issues & Solutions
### Issue: 404 Error When Submitting
**Solution:** Ensure backend is running and accessible
```bash
# Test backend connectivity
curl http://localhost:8000/api/contact/inquiries/ -X OPTIONS
```
### Issue: CORS Errors
**Solution:** Check CORS settings in `backend/config/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://localhost:3001",
"http://atonixdev.org",
]
```
### Issue: 400 Bad Request
**Solution:** Check if all required fields are sent:
- name (required)
- email (required)
- subject (required)
- message (required)
- inquiry_type (required, default: 'general')
### Issue: 500 Internal Server Error
**Solution:** Check backend logs
```bash
docker logs profile_backend
```
## Testing Manually
### Using cURL
```bash
curl -X POST http://localhost:8000/api/contact/inquiries/ \
-H "Content-Type: application/json" \
-d '{
"name": "Test User",
"email": "test@example.com",
"phone": "+1234567890",
"country": "United States",
"country_code": "US",
"company": "Test Company",
"inquiry_type": "general",
"subject": "Test Subject",
"message": "Test message content",
"budget": "5k-15k"
}'
```
### Using Postman
1. Create new POST request
2. URL: `http://localhost:8000/api/contact/inquiries/`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
"name": "Test User",
"email": "test@example.com",
"phone": "+1234567890",
"country": "United States",
"country_code": "US",
"company": "Test Company",
"inquiry_type": "general",
"subject": "Test Subject",
"message": "Test message content",
"budget": "5k-15k"
}
```
## Email Notifications (Optional Setup)
To receive email notifications when inquiries are submitted, configure in backend:
### Update `backend/config/settings.py`:
```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'
# Admin notification email
ADMIN_EMAIL = 'admin@atonixdev.org'
```
### Create Signal for Email Notifications
Add to `backend/contact/signals.py`:
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Inquiry
@receiver(post_save, sender=Inquiry)
def send_inquiry_notification(sender, instance, created, **kwargs):
if created:
subject = f"New Inquiry: {instance.subject}"
message = f"""
New inquiry received:
Name: {instance.name}
Email: {instance.email}
Country: {instance.country}
Company: {instance.company}
Type: {instance.inquiry_type}
Budget: {instance.budget}
Message:
{instance.message}
---
Admin Link: http://localhost:8000/admin/contact/inquiry/{instance.id}/change/
"""
send_mail(
subject,
message,
settings.DEFAULT_FROM_EMAIL,
[settings.ADMIN_EMAIL],
fail_silently=True
)
```
Register signal in `backend/contact/apps.py`:
```python
from django.apps import AppConfig
class ContactConfig(AppConfig):
default_auto_field = 'django.db.models.BigAutoField'
name = 'contact'
def ready(self):
import contact.signals
```
## Debugging Steps
1. **Check if form submits:**
- Open browser DevTools → Network tab
- Submit the contact form
- Look for POST request to `/api/contact/inquiries/`
- Check response status code
2. **Check if backend receives it:**
```bash
docker logs profile_backend | grep "inquiry\|Inquiry\|contact"
```
3. **Verify data in database:**
- Login to Django admin
- Navigate to Contact → Inquiries
- Look for your test submission
4. **Check CORS headers:**
- In DevTools, check the failed request headers
- Look for `Access-Control-Allow-Origin`
5. **Verify API endpoint:**
- Visit `http://localhost:8000/api/contact/inquiries/` in browser
- You should see API documentation or a form
