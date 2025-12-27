# Chatbot UI Troubleshooting Guide

## Quick Checklist

### 1. **Verify Backend is Running**
```bash
# Terminal 1: Start Django backend
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver
```
✅ Check: You should see `Starting development server at http://127.0.0.1:8000/`

### 2. **Verify Frontend is Running**
```bash
# Terminal 2: Start React frontend
cd /home/atonixdev/profile/frontend
npm start
```
✅ Check: Frontend opens at http://localhost:3000

### 3. **Check the Chat Button**
- Open browser DevTools: **F12** or **Right-click → Inspect**
- Look in **bottom-right corner** for a **purple-blue button with 💬 emoji**
- If not visible, check the **Console tab** for errors

### 4. **Test the API Directly**
Open `CHATBOT_TEST.html` in your browser and click "Send Message"
- This tests if the backend is working correctly
- No need for the React app to be running

### 5. **Browser Console Checks**
Open DevTools (F12) → Console tab:

**You should see:**
```
FloatingChatbot mounted
```

**If you see errors**, check:
- `axios is not defined` → npm install axios
- `Cannot find module` → npm install

### 6. **Check Network Requests**
In DevTools, go to **Network tab**:
1. Open the chat by clicking the 💬 button
2. Send a message
3. Look for a POST request to `/api/chatbot/chat/`
   - ✅ Status 200 = API working
   - ❌ Status 404 = Backend route not registered
   - ❌ CORS error = Check CORS_ALLOWED_ORIGINS in settings.py

## Common Issues & Fixes

### Issue 1: Chat button not visible
**Solution:**
```bash
# Rebuild frontend
cd frontend
npm run build
npm start
```

### Issue 2: Chat button visible but doesn't open
**Solution:**
- Press F12 to open DevTools
- Check Console for JavaScript errors
- Clear browser cache: Ctrl+Shift+Delete

### Issue 3: Chat opens but API doesn't respond
**Solution:**
```bash
# Check if backend is running
lsof -ti:8000

# If nothing, start backend
cd backend && source venv/bin/activate && python manage.py runserver
```

### Issue 4: CORS errors in console
**Solution:**
- Ensure `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py` includes:
  ```python
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ```

### Issue 5: Chat sends message but gets no response
**Solution:**
```bash
# Test API manually
curl -X POST http://localhost:8000/api/chatbot/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Hello! 👋 I'm here to help...",
  "specialization": null,
  "technologies": null,
  "suggested_page": null
}
```

## Step-by-Step Startup

**Terminal 1 - Backend:**
```bash
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py runserver
```
Wait for: `Starting development server at http://127.0.0.1:8000/`

**Terminal 2 - Frontend:**
```bash
cd /home/atonixdev/profile/frontend
npm start
```
Wait for: Browser opens at http://localhost:3000

**Check:**
1. Browser opens automatically at http://localhost:3000
2. Look for **purple-blue button** (💬) in **bottom-right corner**
3. Click button to open chat
4. Type: "help with cloud infrastructure"
5. Should see response with technologies listed

## File Structure

```
frontend/
  src/
    components/
      FloatingChatbot.js  ✅ Chat widget component
    App.js  ✅ FloatingChatbot imported here

backend/
  chatbot_service/
    __init__.py
    apps.py
    responses.py  ✅ Intent matching logic
    views.py  ✅ API endpoint
    urls.py  ✅ Route configuration
  config/
    settings.py  ✅ chatbot_service in INSTALLED_APPS
    urls.py  ✅ chatbot routes included
```

## Recent Fixes Applied

✅ **Moved FloatingChatbot outside Router** - Ensures it's always rendered
✅ **Added inline styles** - Fallback for Tailwind CSS
✅ **Increased z-index to 50** - Ensures it's above other elements  
✅ **Fixed API endpoint** - Uses `process.env.REACT_APP_API_URL` with fallback
✅ **Added mount/unmount logging** - Check console for component lifecycle

## Test Commands

```bash
# Test backend API
curl -X POST http://localhost:8000/api/chatbot/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Check if port 8000 is in use
lsof -i :8000

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Rebuild frontend
cd frontend && npm run build

# Clear npm cache
npm cache clean --force && npm install
```

## Still Not Working?

1. **Check Git status:**
   ```bash
   git status
   ```

2. **Verify recent changes:**
   ```bash
   git diff HEAD~5
   ```

3. **Check for errors:**
   ```bash
   cd backend && python manage.py check
   cd frontend && npm run build --verbose
   ```

4. **Review log files:**
   - Backend console output
   - Browser DevTools Console (F12)
   - Browser DevTools Network tab (Requests)

5. **Contact support** with:
   - Backend console output
   - Browser console errors (F12)
   - Screenshot of the screen

## Success Indicators

✅ Chat button visible (bottom-right corner)  
✅ Button responds to click (opens/closes)  
✅ Chat window opens with initial greeting  
✅ Can type messages  
✅ Send button enabled when typing  
✅ Bot responds with technology recommendations  
✅ No red errors in browser console  
✅ Network request shows Status 200
