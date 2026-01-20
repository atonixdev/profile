# 🚀 AI Chatbot - QUICK SETUP (Read This First!)

## ⚠️ Current Error
```
"Unable to connect to AI service"
```

**Reason:** Missing API key + Backend not running

---

## ✅ 3-Step Fix

### Step 1️⃣: Get Free API Key (Go Here NOW)

**👉 https://huggingface.co/settings/tokens**

Steps:
1. Sign up (free)
2. Click "New token"
3. Name: "atonixdev" 
4. Permission: "read"
5. Click "Create token"
6. **COPY it** (looks like: `hf_abc123def456`)

---

### Step 2️⃣: Update .env File

**File location:**
```
/home/atonixdev/profile/.env
```

**Currently says:**
```
HUGGINGFACE_API_KEY=hf_YOUR_KEY_HERE
```

**Change to your actual key from Step 1:**
```
HUGGINGFACE_API_KEY=hf_abc123def456ghi789
```

**How to edit:**
```bash
nano /home/atonixdev/profile/.env
```

Save: `Ctrl+X` → `Y` → `Enter`

---

### Step 3️⃣: Start Backend & Frontend

**Terminal 1 (Backend):**
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 (Frontend):**
```bash
cd /home/atonixdev/profile/frontend
npm start
```

---

## ✅ Test It

1. Open: http://localhost:3000
2. Click chat button (bottom-right) 💬
3. Type: "Hello"
4. Wait 3-10 seconds
5. **You get AI response!** ✨

---

## 📁 Files for Reference

| File | Purpose |
|------|---------|
| `README_CHATBOT_ERROR_FIX.md` | **← Start here (you are here)** |
| `AI_CHATBOT_FIX.md` | Quick 2-step fix guide |
| `AI_CHATBOT_QUICKSTART.md` | 5-minute setup |
| `AI_CHATBOT_TROUBLESHOOTING.md` | Full troubleshooting |
| `start_chatbot.sh` | Auto-start script |

---

## 🎯 The Absolute Minimum

```bash
# 1. Edit .env and add your API key
nano /home/atonixdev/profile/.env

# 2. Start backend
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

# 3. (New terminal) Start frontend
cd /home/atonixdev/profile/frontend  
npm start

# 4. Open http://localhost:3000 and test chat
```

---

## ❓ Common Issues

| Problem | Fix |
|---------|-----|
| Still getting error | Backend not running, or API key not set |
| Slow response | Normal (free tier), wait 5-10 seconds |
| "Connection refused" | Backend isn't running on port 8000 |
| Port 8000 already in use | `pkill -f "manage.py runserver"` |

---

## 🤖 What This AI Does

- ✅ Answers questions about your services
- ✅ Discusses your projects  
- ✅ Explains pricing
- ✅ Remembers conversation context
- ✅ Stores all messages
- ✅ Available 24/7

---

## 📊 Status Check

Run this to verify setup:

```bash
# Check API key is set
grep HUGGINGFACE_API_KEY /home/atonixdev/profile/.env

# Check backend running
curl http://localhost:8000/api/status/

# Test chat API
curl -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

---

## 🚀 You Got This!

Once you follow these 3 steps, your AI chatbot will be live!

**Questions?** See `AI_CHATBOT_TROUBLESHOOTING.md`
