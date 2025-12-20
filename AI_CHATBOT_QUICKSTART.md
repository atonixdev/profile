# AI Chatbot - Quick Start (5 Minutes)

## 1. Get API Key (2 minutes)

1. Go to https://huggingface.co/signup (free)
2. Create account
3. Go to Settings → Access Tokens
4. Click "New token"
5. Give it a name, select "read" permission
6. Copy the token (starts with `hf_`)

## 2. Set Environment Variable (1 minute)

**Linux/Mac:**
```bash
cd /home/atonixdev/profile/backend
echo "HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE" >> .env
```

Replace `hf_YOUR_TOKEN_HERE` with your actual key.

**Or create `backend/.env` file with:**
```
HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
```

## 3. Start Backend (1 minute)

```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

## 4. Start Frontend (1 minute)

In a new terminal:
```bash
cd /home/atonixdev/profile/frontend
npm start
```

You should see:
```
Compiled successfully!
```

## 5. Test It (5 seconds)

1. Open http://localhost:3000
2. Click chat button (bottom-right corner)
3. Ask: "What services do you offer?"
4. Wait for AI response
5. Try more questions!

## Done!

Your AI chatbot is now live and using machine learning!

### What's Happening

- **Frontend:** Sends your message to backend
- **Backend:** Calls Hugging Face AI API with company context
- **AI Model:** Mistral 7B understands your question
- **Response:** Returns intelligent answer about your company
- **Storage:** All messages saved for analysis

### Troubleshooting

**Error: "Unable to connect"**
- Check backend is running
- Check API key is set correctly
- Hugging Face might be slow (normal)

**Empty Response**
- Might be loading, wait 5 seconds
- Check browser console for errors

**Chat won't open**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Key Files

- **Setup Guide:** `AI_CHATBOT_SETUP.md`
- **Full Summary:** `AI_CHATBOT_COMPLETE.md`
- **Backend Code:** `backend/chatbot/`
- **Frontend Code:** `frontend/src/components/LiveChat.js`
- **Admin:** http://localhost:8000/admin/

## Next

See `AI_CHATBOT_SETUP.md` for:
- Customizing AI responses
- Changing the AI model
- Production deployment
- Performance optimization
- Database management
