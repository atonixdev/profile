# AI Chatbot - IMMEDIATE FIX (2 Steps)

## The Problem
Your chatbot shows "Unable to connect to AI service" because:
1. ❌ No Hugging Face API key is set
2. ❌ Backend is not running

## The Solution

### Step 1: Get Your Free API Key (1 minute)

**Go to:** https://huggingface.co/settings/tokens

**Follow these steps:**
1. Click "Sign up" if you don't have an account (free)
2. Go to Settings → Access Tokens
3. Click "New token"
4. Name: "atonixdev-chatbot"
5. Permission: Select "read"
6. Click "Create token"
7. **Copy the token** (it starts with `hf_`)

Example: `hf_abc123defg456hij789klm`

---

### Step 2: Add API Key to Your Backend

**Option A: Edit .env file directly**

```bash
nano /home/atonixdev/profile/.env
```

Find this line:
```
HUGGINGFACE_API_KEY=hf_YOUR_KEY_HERE
```

Replace `hf_YOUR_KEY_HERE` with your actual key from Step 1.

Example:
```
HUGGINGFACE_API_KEY=hf_abc123defg456hij789klm
```

Save and exit (Ctrl+X, then Y, then Enter)

**Option B: Replace directly from terminal**

```bash
# Replace YOUR_API_KEY with your actual key from Hugging Face
sed -i 's/hf_YOUR_KEY_HERE/hf_YOUR_ACTUAL_KEY/g' /home/atonixdev/profile/.env

# Verify it worked
cat /home/atonixdev/profile/.env | grep HUGGINGFACE
```

---

### Step 3: Start the Backend

**Terminal 1 (Backend):**
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

### Step 4: Start the Frontend

**Terminal 2 (Frontend):**
```bash
cd /home/atonixdev/profile/frontend
npm start
```

You should see:
```
webpack compiled successfully
```

---

### Step 5: Test the Chat!

1. Open http://localhost:3000 in your browser
2. Click the **chat button** (bottom-right corner)
3. Type: "Hello, tell me about your services"
4. **Wait 3-10 seconds** for AI response
5. ✅ Chat should work!

---

## Troubleshooting

### Still Getting "Unable to connect" Error?

**Check 1: Is backend running?**
```bash
curl http://localhost:8000/api/status/
```
Should show: `{"status":"ok"}`

**Check 2: Is API key set correctly?**
```bash
cat /home/atonixdev/profile/.env | grep HUGGINGFACE_API_KEY
```
Should show: `HUGGINGFACE_API_KEY=hf_...`

**Check 3: Is the key valid?**
Go to https://huggingface.co/settings/tokens and verify token hasn't expired

**Check 4: Browser console error**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Click "Ask" in chat
6. Check if `api/chatbot/ask/` request succeeds (200 status)

### Slow Response (10+ seconds)?
- Normal for free Hugging Face tier
- Wait longer or upgrade to paid tier

### Still not working?
See `AI_CHATBOT_TROUBLESHOOTING.md` for complete diagnostic guide

---

## Quick Commands

**Check everything is set up:**
```bash
# 1. Verify .env has API key
grep HUGGINGFACE_API_KEY /home/atonixdev/profile/.env

# 2. Verify backend is running
curl http://localhost:8000/api/status/

# 3. Test chat endpoint directly
curl -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

---

## That's It!

Once you:
1. ✅ Get Hugging Face API key
2. ✅ Add it to .env
3. ✅ Start backend
4. ✅ Start frontend

Your AI chatbot will work!
