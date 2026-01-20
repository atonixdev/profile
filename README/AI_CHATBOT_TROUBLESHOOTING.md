# AI Chatbot - Troubleshooting Guide

## Error: "Unable to connect to AI service"

This error appears when the chatbot cannot reach the backend API or Hugging Face service.

---

## Diagnostic Checklist

### 1. Is Backend Running?

**Check:**
```bash
curl http://localhost:8000/api/status/
```

**Expected Response:**
```json
{"status": "ok"}
```

**If Failed:**
Start the backend:
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

---

### 2. Is Hugging Face API Key Set?

**Check if .env file exists:**
```bash
ls -la /home/atonixdev/profile/.env
```

**Check if key is set:**
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python -c "import os; print('API Key:', os.getenv('HUGGINGFACE_API_KEY'))"
```

**Expected Output:**
```
API Key: hf_YOUR_ACTUAL_KEY_HERE
```

**If Missing:**
1. Create `.env` file:
```bash
cat > /home/atonixdev/profile/.env << 'EOF'
HUGGINGFACE_API_KEY=hf_YOUR_API_KEY_HERE
EOF
```

2. Replace `hf_YOUR_API_KEY_HERE` with your actual Hugging Face API key

3. Get API key at: https://huggingface.co/settings/tokens

---

### 3. Check Backend API Endpoint

**Test chatbot endpoint directly:**
```bash
curl -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Expected Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "AI-generated response...",
  "response_time_ms": 2150,
  "messages": [...]
}
```

**If Failed with Error:**
- Check backend console for error message
- Verify API key is valid
- Hugging Face API might be slow/down

---

### 4. Check CORS Configuration

**Backend CORS setting:**
```bash
grep -n "CORS" /home/atonixdev/profile/backend/config/settings.py
```

**Should show:**
```
CORS_ALLOWED_ORIGINS = [...]
or
CORS_ALLOW_ALL_ORIGINS = True
```

**If Missing, Add to settings.py:**
```python
CORS_ALLOW_ALL_ORIGINS = True  # For development only!
```

---

### 5. Check Frontend URL

**In frontend component, verify API URL:**
```bash
grep -n "localhost:8000" /home/atonixdev/profile/frontend/src/components/LiveChat.js
```

**Should be:**
```
http://localhost:8000/api/chatbot/ask/
```

---

## Common Issues & Solutions

### Issue 1: "Backend is not running"

**Symptom:** Connection refused error

**Solution:**
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

**Verify:**
```bash
curl http://localhost:8000/
```

---

### Issue 2: "API Key not set"

**Symptom:** Timeout or 500 error from backend

**Solution:**
```bash
# 1. Create .env file
echo "HUGGINGFACE_API_KEY=hf_YOUR_KEY" > /home/atonixdev/profile/.env

# 2. Get key from https://huggingface.co/settings/tokens
# 3. Restart backend
```

---

### Issue 3: "CORS blocked the request"

**Symptom:** Browser console shows CORS error

**Solution:** Edit `backend/config/settings.py`

Add or modify:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Dev only!

# Or for production:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://atonixdev.org",
]
```

Then restart backend.

---

### Issue 4: "Hugging Face API is slow"

**Symptom:** Response takes 10+ seconds or times out

**Cause:** Free tier is shared across many users

**Solutions:**
1. Wait longer (normal for free tier)
2. Use paid Hugging Face API tier
3. Self-host the model
4. Add timeout extension in frontend

---

### Issue 5: "Invalid API Key"

**Symptom:** Error mentions invalid token

**Solution:**
1. Go to https://huggingface.co/settings/tokens
2. Check token is not expired
3. Check token has "read" permission
4. Generate a new token if needed
5. Update .env file
6. Restart backend

---

## Step-by-Step Setup Verification

### Step 1: Backend Dependencies ✅
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python -c "import requests; import huggingface_hub; print('✅ Dependencies OK')"
```

### Step 2: Database ✅
```bash
python manage.py migrate chatbot
```

### Step 3: Environment Variable ✅
```bash
cat .env | grep HUGGINGFACE_API_KEY
```

### Step 4: Start Backend ✅
```bash
python manage.py runserver 0.0.0.0:8000
```

**Check output:**
```
Starting development server at http://127.0.0.1:8000/
```

### Step 5: Test Endpoint ✅
```bash
curl -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### Step 6: Start Frontend ✅
```bash
cd /home/atonixdev/profile/frontend
npm start
```

### Step 7: Test Chat ✅
1. Open http://localhost:3000
2. Click chat button
3. Type message
4. Should get AI response

---

## Backend Logs

**Check for errors:**
```bash
# If running with nohup
tail -f /home/atonixdev/profile/backend/server.log

# Or check Django logs
tail -f /home/atonixdev/profile/backend/server_django.log
```

**Look for:**
- "HUGGINGFACE_API_KEY" error
- "Connection refused" 
- "Timeout"
- "Invalid token"

---

## Frontend Console

**Check browser console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking chat
4. Check Network tab for failed requests

**Expected successful request:**
```
POST http://localhost:8000/api/chatbot/ask/
Status: 200
Response: { session_id, response, ... }
```

---

## Quick Verification Script

Run this to check everything:

```bash
#!/bin/bash

echo "=== AI Chatbot Verification ==="
echo ""

echo "1. Checking Backend..."
if curl -s http://localhost:8000/api/status/ > /dev/null; then
  echo "✅ Backend is running"
else
  echo "❌ Backend NOT running"
  echo "   Start with: python manage.py runserver 0.0.0.0:8000"
fi

echo ""
echo "2. Checking API Key..."
cd /home/atonixdev/profile/backend
if grep -q "HUGGINGFACE_API_KEY" .env 2>/dev/null; then
  echo "✅ API Key is set"
  API_KEY=$(grep "HUGGINGFACE_API_KEY" .env | cut -d'=' -f2)
  if [[ $API_KEY == hf_* ]]; then
    echo "   ✅ Key format looks correct"
  else
    echo "   ❌ Key format incorrect (should start with 'hf_')"
  fi
else
  echo "❌ API Key NOT set"
  echo "   Add to .env: HUGGINGFACE_API_KEY=hf_YOUR_KEY"
fi

echo ""
echo "3. Testing Chat Endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}')

if echo "$RESPONSE" | grep -q "response"; then
  echo "✅ Chat endpoint working"
else
  echo "❌ Chat endpoint error"
  echo "   Response: $RESPONSE"
fi

echo ""
echo "=== Setup Complete ==="
```

---

## What Each Error Means

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | Backend not running | `python manage.py runserver` |
| 400 Bad Request | Invalid message format | Check request JSON |
| 401 Unauthorized | Invalid API key | Check HUGGINGFACE_API_KEY |
| 500 Server Error | Backend crash | Check server logs |
| Timeout | Hugging Face slow | Wait or upgrade tier |
| CORS error | Frontend can't reach backend | Enable CORS in Django |
| Empty response | API returned nothing | Check API key validity |

---

## Support Resources

- **Hugging Face Status:** https://status.huggingface.co/
- **Check API Key:** https://huggingface.co/settings/tokens
- **Hugging Face Docs:** https://huggingface.co/docs/hub/security-tokens
- **Django CORS:** https://github.com/adamchainz/django-cors-headers

---

## Still Having Issues?

1. **Check all 5 diagnostic steps** above
2. **Run the verification script** to identify exact issue
3. **Check backend console** for error messages
4. **Check browser console** (F12) for JavaScript errors
5. **Check network tab** to see API request/response

Most common:
- **API key not set** (90%)
- **Backend not running** (9%)
- **CORS misconfiguration** (1%)
