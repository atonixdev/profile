# AI Chatbot Architecture & Implementation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AtonixDev Website (React)                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  LiveChat Component                              │  │  │
│  │  │  - Chat Button (bottom-right)                   │  │  │
│  │  │  - Message Input                                │  │  │
│  │  │  - Message Display                              │  │  │
│  │  │  - Typing Indicator                             │  │  │
│  │  │  - Quick Replies                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                     │
│         │ Axios HTTP Request                                 │
│         │ POST /api/chatbot/ask/                             │
│         │ { session_id, message }                            │
│         ↓                                                     │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ Network
                      │
┌─────────────────────────────────────────────────────────────┐
│              BACKEND DJANGO API                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ChatAPIView                                          │  │
│  │  - Receive message                                   │  │
│  │  - Create/get ChatSession                            │  │
│  │  - Save user message to ChatMessage model            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  HuggingFaceAI Service                          │ │  │
│  │  │  1. Get system prompt (company knowledge)      │ │  │
│  │  │  2. Build message history from ChatMessage     │ │  │
│  │  │  3. Format messages for Mistral model          │ │  │
│  │  │  4. Call Hugging Face Inference API            │ │  │
│  │  │  5. Parse response                             │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  - Save bot response to ChatMessage model            │  │
│  │  - Return JSON response                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                      │                                       │
│         ┌────────────┼────────────┐                          │
│         ↓            ↓            ↓                          │
│     ┌─────────┐ ┌─────────┐ ┌──────────┐                    │
│     │ChatSessionModel   │ │ Database │                      │
│     │(UUID, dates,     │ │          │                      │
│     │visitor_info)      │ │ SQLite   │                      │
│     └─────────┘ └─────────┘ └──────────┘                    │
│                │                                             │
│         ┌──────┴──────┐                                      │
│         ↓             ↓                                      │
│     ┌──────────────────────┐                               │
│     │ ChatMessage Model    │                               │
│     │ - sender (visitor|bot)                               │
│     │ - message text                                       │
│     │ - timestamps                                         │
│     │ - response_time_ms                                  │
│     └──────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ HTTPS Request
                      │ (Format: JSON with messages)
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         HUGGING FACE INFERENCE API (Cloud)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Mistral 7B Instruct Model                            │  │
│  │  - Receives system prompt + conversation history     │  │
│  │  - Understands natural language                      │  │
│  │  - Generates intelligent response                    │  │
│  │  - Returns generated text                            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                     │
│         │ HTTPS Response                                      │
│         │ (JSON with generated_text)                          │
│         ↓                                                     │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ JSON Response
                      │ { session_id, response, messages[] }
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Frontend receives response                                   │
│  - Parse JSON                                               │
│  - Add bot message to state                                │
│  - Display in chat window                                  │
│  - Stop typing indicator                                   │
│  - Ready for next message                                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         App.js                               │
│   (Wraps app with LiveChatProvider)                         │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─→ LiveChatContext.Provider
         │   ├─→ isChatOpen (state)
         │   ├─→ openChat() (function)
         │   ├─→ closeChat() (function)
         │   └─→ toggleChat() (function)
         │
         ├─→ Router
         │   ├─→ FAQ Page
         │   │   └─→ useLiveChat() → calls openChat()
         │   │
         │   └─→ All Pages
         │       └─→ Can use chat from anywhere
         │
         └─→ LiveChat Component
             ├─→ Floating Button (when closed)
             ├─→ Chat Window (when open)
             │   ├─→ Header
             │   ├─→ Message List
             │   ├─→ Quick Replies
             │   └─→ Input Form
             │
             ├─→ useLiveChat() hook
             │   └─→ Gets isChatOpen, setIsChatOpen, closeChat
             │
             └─→ Axios API calls
                 └─→ POST /api/chatbot/ask/
```

## Data Models

### ChatSession
```python
session_id: UUID (unique)
created_at: datetime
updated_at: datetime
visitor_info: {
    "name": "John Doe",
    "email": "john@example.com"
}
messages: [ChatMessage, ChatMessage, ...]
```

### ChatMessage
```python
id: int (primary key)
session: ChatSession (foreign key)
sender: "visitor" | "bot"
message: "user's question or bot's response"
created_at: datetime
response_time_ms: int (null for visitor messages)
```

## API Endpoint

### POST /api/chatbot/ask/

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Tell me about your services",
  "visitor_name": "John (optional)",
  "visitor_email": "john@example.com (optional)"
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "AtonixDev offers Software Engineering, Cloud Infrastructure, AI/ML Solutions, and DevOps services. We specialize in building scalable, intelligent systems using modern technologies like React, Django, Kubernetes, and AWS. What specific service are you interested in?",
  "response_time_ms": 2150,
  "messages": [
    {
      "id": 1,
      "sender": "visitor",
      "message": "Tell me about your services",
      "created_at": "2025-12-19T15:30:00Z",
      "response_time_ms": null
    },
    {
      "id": 2,
      "sender": "bot",
      "message": "AtonixDev offers Software Engineering...",
      "created_at": "2025-12-19T15:30:02Z",
      "response_time_ms": 2150
    }
  ]
}
```

## Files Structure

```
backend/chatbot/
├── __init__.py
├── models.py              # ChatSession, ChatMessage models
├── views.py               # ChatAPIView, ChatSessionAPIView
├── serializers.py         # Request/response serializers
├── urls.py                # URL routing
├── admin.py               # Django admin configuration
├── apps.py                # App config
├── ai_service.py          # HuggingFaceAI service
└── migrations/
    └── 0001_initial.py    # Database migrations

frontend/src/components/
└── LiveChat.js            # Main chat component
    ├── State management (useState)
    ├── Session management (useEffect, localStorage)
    ├── API calls (axios)
    ├── UI components (buttons, input, messages)
    └── Error handling
```

## AI Knowledge Base (System Prompt)

```
COMPANY INFO:
- Name: AtonixDev
- Website: atonixdev.org
- Contact: contact@atonixdev.org

SERVICES:
1. Software Engineering
   - Custom development (React, Django, Python)
   - Full-stack solutions
   - Enterprise systems

2. Cloud Infrastructure
   - OpenStack, AWS, Kubernetes
   - Sovereign cloud solutions
   - High availability

3. AI & Machine Learning
   - Model development (TensorFlow, PyTorch)
   - AI research
   - Production ML deployment

4. DevOps & CI/CD
   - Jenkins, GitLab CI, Docker, Kubernetes
   - Infrastructure automation
   - Zero-downtime deployments

EXPERTISE:
- Languages: Python, JS, TS, Java
- Frameworks: Django, React, FastAPI, Spring Boot
- Infrastructure: K8s, OpenStack, AWS, Docker
- AI/ML: TensorFlow, PyTorch, LLMs

PORTFOLIO:
- 6+ major projects completed
- Cloud platforms
- AI research hubs
- Enterprise DevOps

PRICING:
- Small: 5K-15K USD
- Medium: 15K-50K USD
- Large: 50K+ USD
```

## Response Generation Flow

```
User Message: "Tell me about your AI services"
        ↓
1. Save to ChatMessage (sender=visitor)
        ↓
2. Retrieve last 5 messages from ChatSession
        ↓
3. Build prompt:
   ┌──────────────────────────────────┐
   │ SYSTEM PROMPT (company knowledge)│
   │ [5 previous messages]            │
   │ USER: "Tell me about AI services"│
   └──────────────────────────────────┘
        ↓
4. Call Hugging Face API:
   {
     "inputs": "[formatted prompt above]",
     "parameters": {
       "max_new_tokens": 256,
       "temperature": 0.7,
       "top_p": 0.95,
       "repetition_penalty": 1.2
     }
   }
        ↓
5. Mistral 7B Model processes request
   (Understands context, generates response)
        ↓
6. Extract response from API result
        ↓
7. Response: "AtonixDev specializes in AI and Machine Learning 
   solutions including model development, research, and 
   production deployment using TensorFlow and PyTorch..."
        ↓
8. Save to ChatMessage (sender=bot)
        ↓
9. Return to frontend with response + full message history
        ↓
10. Display in chat window
```

## Session Lifecycle

```
User opens chat for first time
        ↓
No session_id in localStorage
        ↓
Frontend sends POST with session_id=null
        ↓
Backend creates new ChatSession with UUID
        ↓
Returns response with new session_id
        ↓
Frontend saves session_id to localStorage
        ↓
User asks multiple questions
        ↓
Each request includes same session_id
        ↓
Backend retrieves existing ChatSession
        ↓
All messages saved in sequence
        ↓
AI has context of entire conversation
        ↓
Can reference previous messages in responses
        ↓
User closes browser
        ↓
Session_id persists in localStorage
        ↓
User returns later
        ↓
Same session_id used
        ↓
AI can reference old messages if needed
```

## Performance Characteristics

| Metric | Value |
|--------|-------|
| First Response | 3-10 seconds |
| Subsequent Responses | 2-8 seconds |
| Message Storage | Instant |
| Session Lookup | <100ms |
| Database Queries | 2-3 per request |
| API Calls | 1 per message |
| Tokens per Request | ~200-300 |
| Max Response Length | 256 tokens (200 words) |

## Security Considerations

```
API Key
├─ Stored in environment variables
├─ Never committed to git
├─ Secured with .gitignore
└─ Can be rotated anytime

CORS
├─ Frontend origin verified
├─ Prevents unauthorized API access
└─ Configured in Django settings

Session Data
├─ Stored in SQLite database
├─ Visitor info optional
├─ No sensitive data stored
└─ Can be deleted anytime

Message Content
├─ Logged to database
├─ Accessible in Django admin
├─ Can be reviewed/archived
└─ Consider privacy policies
```

## Integration Points

```
1. Homepage
   └─→ LiveChat widget always visible
   
2. Services Page
   └─→ Chat to ask about specific service
   
3. Portfolio Page
   └─→ Chat to ask about past projects
   
4. FAQ/Help Page
   └─→ "Start Live Chat" button opens chat
   └─→ Chat offers immediate help
   
5. Contact Page
   └─→ Chat alternative to form
   
6. Blog Page
   └─→ Chat to discuss article topics
   
7. All Pages
   └─→ Chat accessible everywhere
   └─→ Context aware responses
```

## Success Metrics

Track these in Django admin:
- Total chat sessions
- Messages per session
- Average response time
- Visitor engagement
- Conversion to contact form
- FAQs covered by chat

## Roadmap / Future Enhancements

1. **Search in Chat History**
   - Find past conversations
   - Reference old discussions

2. **Chat Transcripts**
   - Email chat history
   - PDF download

3. **Sentiment Analysis**
   - Detect user satisfaction
   - Route to human if needed

4. **Lead Scoring**
   - Identify high-intent visitors
   - Integrate with CRM

5. **Multi-language Support**
   - Translate responses
   - Support non-English users

6. **Custom Model Training**
   - Fine-tune with company data
   - Better accuracy

7. **Real Human Handoff**
   - Route to support team
   - Seamless transition
