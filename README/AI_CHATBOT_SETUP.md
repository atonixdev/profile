# AtonixDev AI Chatbot Setup Guide

## Overview
The chatbot now uses **machine learning** powered by **Hugging Face** to intelligently answer visitor questions. It learns from context and provides smart, contextual responses about your services.

## Features

### AI-Powered Responses
- **Machine Learning Model:** Mistral 7B Instruct (free, open-source)
- **Context Awareness:** Remembers conversation history for better responses
- **Company Knowledge:** Trained on AtonixDev services, portfolio, and expertise
- **Natural Language:** Understands and responds to natural human language

### Session Management
- **Chat Sessions:** Each visitor gets a unique session ID
- **Message History:** Stores all chat messages for context
- **Persistent Sessions:** Sessions saved to browser storage

### Quick Replies
Users can quickly choose common questions:
- Services
- Pricing  
- Projects/Portfolio
- Contact Information

## Backend Setup

### 1. Get Hugging Face API Key

Go to [huggingface.co](https://huggingface.co) and:
1. Create a free account
2. Go to Settings → Access Tokens
3. Create a new `read` token (copy it)

### 2. Add Environment Variable

Create/edit `.env` in the backend root:

```bash
HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
```

Replace `hf_YOUR_TOKEN_HERE` with your actual API key.

### 3. Run Migrations

The chatbot app has already been created with migrations:

```bash
cd backend
source venv/bin/activate
python manage.py migrate chatbot
```

### 4. Start the Backend

```bash
python manage.py runserver 0.0.0.0:8000
```

## API Endpoint

**URL:** `POST http://localhost:8000/api/chatbot/ask/`

**Request:**
```json
{
  "session_id": "uuid or null",
  "message": "Tell me about your services",
  "visitor_name": "John (optional)",
  "visitor_email": "john@example.com (optional)"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "response": "AI-generated answer...",
  "response_time_ms": 2150,
  "messages": [
    {
      "id": 1,
      "sender": "visitor",
      "message": "Tell me about your services",
      "created_at": "2025-12-19T15:30:00Z"
    },
    {
      "id": 2,
      "sender": "bot",
      "message": "AI-generated answer...",
      "created_at": "2025-12-19T15:30:02Z",
      "response_time_ms": 2150
    }
  ]
}
```

## Frontend Setup

The frontend is already configured to use the AI chatbot:

### Key Components

**LiveChat.js** (`frontend/src/components/LiveChat.js`)
- Floating chat widget
- Calls `/api/chatbot/ask/` on the backend
- Displays AI responses
- Handles session management

**Features:**
- Auto-scrolls to latest messages
- Typing indicator while waiting
- Error handling with fallback messages
- Session persistence in localStorage
- Quick reply buttons

### Testing

1. Open the application in browser
2. Click the chat button in bottom-right corner
3. Type a question about services, pricing, or projects
4. Wait for AI response (takes 2-5 seconds)
5. Continue conversation - AI remembers context

## How AI Works

### System Prompt
The AI is given context about:
- Company information (name, website, contact)
- Services (Cloud, AI/ML, DevOps, Software Engineering)
- Portfolio (6+ projects)
- Expertise (languages, frameworks, tools)
- Pricing guidelines

### AI Model
- **Model:** Mistral 7B Instruct (open-source)
- **Provider:** Hugging Face Inference API
- **Language:** English
- **Response Time:** 2-10 seconds

### Response Generation
1. User sends message
2. Backend receives message + session history
3. AI analyzes message and context
4. AI generates intelligent response
5. Response returned to frontend
6. Chat history saved to database

## Admin Dashboard

View all chat sessions and messages in Django admin:

```
http://localhost:8000/admin/chatbot/chatsession/
http://localhost:8000/admin/chatbot/chatmessage/
```

Features:
- View conversation history
- See visitor information (if provided)
- Check response times
- Search messages
- Filter by date/sender

## Database Models

### ChatSession
- `session_id` - Unique UUID
- `created_at` - Session start time
- `updated_at` - Last activity
- `visitor_info` - JSON: {name, email}

### ChatMessage
- `session` - FK to ChatSession
- `sender` - 'visitor' or 'bot'
- `message` - Message text
- `created_at` - Message time
- `response_time_ms` - AI response time (bot only)

## Troubleshooting

### "Unable to connect to AI service"
1. Check Hugging Face API key is set
2. Verify backend is running
3. Check network connection
4. Hugging Face API might be slow (normal for free tier)

### Slow Responses (5-10 seconds)
- This is normal for free Hugging Face API
- For production, consider paid tier or self-hosting

### Chat not opening
- Check browser console for errors
- Verify LiveChat context is working
- Check if chat button click triggers state change

### CORS Errors
- Add `http://localhost:3000` to Django CORS_ALLOWED_ORIGINS
- Or set `CORS_ALLOW_ALL_ORIGINS=True` in settings

## Customization

### Change AI Model
Edit `backend/chatbot/ai_service.py`:

```python
self.api_url = "https://api-inference.huggingface.co/models/YOUR_MODEL"
```

Popular models:
- `mistralai/Mistral-7B-Instruct-v0.1` (current)
- `meta-llama/Llama-2-7b-chat` 
- `tiiuae/falcon-7b-instruct`

### Update System Prompt
Edit the `get_system_prompt()` method in `ai_service.py` to:
- Add more company information
- Change tone/personality
- Add/remove topics
- Include pricing details

### Adjust Response Parameters
In `ai_service.py` `generate_response()`:

```python
"max_new_tokens": 256,      # Max response length
"temperature": 0.7,         # Creativity (0-1)
"top_p": 0.95,             # Diversity
"repetition_penalty": 1.2,  # Avoid repetition
```

## Performance Optimization

For production deployments:

1. **Cache Responses**
   - Cache similar questions
   - Reduce API calls

2. **Self-Host Model**
   - Lower latency
   - No API limits
   - Higher cost

3. **Queue Long Requests**
   - Use Celery for async processing
   - Show loading state to users

4. **Rate Limiting**
   - Limit requests per user
   - Prevent abuse

## Security Considerations

- API key stored in environment variables (not in code)
- CORS configured for specific origins
- Session IDs are UUIDs (not easily guessable)
- Chat messages stored in database (can be reviewed)

## Next Steps

1. Set up Hugging Face API key
2. Test chat with various questions
3. Monitor response times in admin
4. Customize system prompt for your needs
5. Deploy to production

## Support

For issues or questions about the AI chatbot:
- Check Django logs: `backend/server.log`
- Check browser console for frontend errors
- Visit Hugging Face docs: https://huggingface.co/docs
- Review Mistral model: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1
