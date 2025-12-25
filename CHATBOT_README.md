# AI-Powered Chatbot Assistant

## Overview
A rule-based chatbot that helps visitors find relevant services and technology solutions based on their needs. The chatbot uses intelligent pattern matching to understand user queries and recommend appropriate services and technologies from your specializations.

## Features

### Backend (`chatbot_service`)
- **Rule-based Intent Matching**: Understands user queries through pattern matching
- **Service Recommendations**: Suggests relevant services based on user input
- **Technology Matching**: Displays relevant technologies for matched specializations
- **6 Core Specializations**:
  - Cloud Infrastructure & Architecture (31 technologies)
  - AI & Machine Learning (25 technologies)
  - DevOps & CI/CD (33 technologies)
  - Full-Stack Development (31 technologies)
  - IoT & Embedded Systems (34 technologies)
  - Security & Compliance (36 technologies)

### Frontend Component
- **Floating Chat Widget**: Non-intrusive chat button in bottom-right corner
- **Real-time Responses**: Instant replies with technology recommendations
- **Technology Display**: Shows relevant technologies and skills
- **Suggested Navigation**: Directs users to relevant pages (Portfolio, Services, Contact)
- **Responsive Design**: Works on all screen sizes
- **Clean UI**: Professional gradient design matching site branding

## API Endpoints

### POST `/api/chatbot/chat/`
Sends a user message and returns chatbot response with recommendations.

**Request:**
```json
{
  "message": "I need help with cloud infrastructure"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Great! You're interested in cloud infrastructure...",
  "specialization": "cloud",
  "technologies": ["OpenStack", "AWS", "Google Cloud", ...],
  "suggested_page": "Services"
}
```

## Conversation Examples

### Cloud Infrastructure Query
**User**: "I need help scaling my application"
**Bot**: Recommends Cloud Infrastructure & Architecture with relevant technologies

### AI/ML Query
**User**: "We want to build an AI chatbot"
**Bot**: Recommends AI & Machine Learning with TensorFlow, PyTorch, LLM Integration, etc.

### DevOps Query
**User**: "Help with CI/CD pipelines"
**Bot**: Recommends DevOps & CI/CD with Jenkins, GitLab CI, Kubernetes, etc.

## Intent Categories

The chatbot recognizes 15+ intents:
- Greeting & Help
- Cloud Infrastructure
- AI & Machine Learning
- DevOps & CI/CD
- Full-Stack Development
- IoT & Embedded Systems
- Security & Compliance
- Portfolio/Projects
- Services
- Contact/Meeting
- Budget/Pricing
- Timeline/Deadlines

## Configuration

### Add New Intents
Edit `backend/chatbot_service/responses.py`:

```python
INTENTS = {
    'your_intent': {
        'patterns': ['keyword1', 'keyword2', 'keyword3'],
        'specialization': 'cloud',  # optional
        'response': 'Your response message'
    }
}
```

### Add New Technologies
Update specializations in `responses.py`:

```python
SPECIALIZATIONS = {
    'cloud': {
        'technologies': ['existing...', 'new_technology'],
        ...
    }
}
```

## Usage

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access Chat**: Click the 💬 button in bottom-right corner of the website

## Files

- `backend/chatbot_service/__init__.py` - App initialization
- `backend/chatbot_service/responses.py` - Intent matching & response logic
- `backend/chatbot_service/views.py` - API endpoint
- `backend/chatbot_service/urls.py` - URL routing
- `frontend/src/components/FloatingChatbot.js` - React chat widget
- `backend/config/settings.py` - Django app registration
- `backend/config/urls.py` - URL configuration

## Future Enhancements

1. **AI Integration**: Replace rule-based system with LLM (OpenAI, Claude, etc.)
2. **Conversation History**: Store and retrieve user conversations
3. **Admin Dashboard**: Manage intents and responses
4. **Analytics**: Track popular questions and user behavior
5. **Multi-language Support**: Support multiple languages
6. **Custom Responses**: Allow admin to customize chatbot replies
7. **Lead Capture**: Collect contact info from interested users
8. **Integration**: Connect with CRM systems

## Troubleshooting

**Chatbot not responding:**
- Check if backend is running on `http://localhost:8000`
- Verify `chatbot_service` is added to `INSTALLED_APPS`
- Check browser console for API errors

**No technologies displayed:**
- Verify specialization key exists in `SPECIALIZATIONS`
- Check that technologies array is not empty

**CORS errors:**
- Ensure `corsheaders` is installed and configured in Django
- Verify frontend and backend URLs are correct

## Support
For questions or improvements, contact the development team.
