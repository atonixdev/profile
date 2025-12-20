# 🤖 Chatbot Admin Panel - Access Guide

## Two Ways to View Chat Conversations

### Option 1: Django Admin Panel (Quickest)

**URL**: `http://localhost:8000/admin/`

**Steps:**
1. Log in with your Django admin credentials
2. Look for **"Chatbot Service"** section
3. Click **"Chat Conversations"**
4. You'll see a list of all conversations with:
   - Conversation ID
   - Visitor name & email
   - Current status (active, waiting_support, in_support, closed)
   - Message count
   - Created date

**Features:**
- Click any conversation to view/edit details
- See all messages inline (read-only)
- Filter by status or date
- Search by visitor name or email
- Update conversation status to "closed"

**Admin Access:**
```bash
# Must have superuser or staff account
python manage.py createsuperuser  # If you don't have one
```

---

### Option 2: React Admin Dashboard (Full Featured)

**URL**: `http://localhost:3000/admin/chat`

**Requirements:**
1. Must be logged in to React admin
2. Frontend must be running (`npm start`)

**Steps:**
1. Go to `http://localhost:3000/admin/`
2. Log in with your credentials
3. Click the **"💬 Manage Chats"** card
4. Or directly visit: `http://localhost:3000/admin/chat`

**Features:**
- **Left sidebar**: List of conversations with filtering
- **Right panel**: Full conversation view with message thread
- **Status badges**: Color-coded status indicators
  - 🟡 Yellow = Waiting for Support
  - 🟢 Green = In Support
  - ⚫ Gray = Closed
  - 🔵 Blue = Active

- **Status Filter Options:**
  - ⏳ Waiting for Support (NEW requests)
  - ✅ In Support (Currently handling)
  - 💬 Active (Still chatting with bot)
  - ❌ Closed (Completed)

- **Message Thread:**
  - 👤 Blue = Visitor messages
  - 🤖 Purple = Bot responses
  - ✅ Green = Admin replies
  - 📢 Gray = System messages

- **Reply to Visitor:** Type response and click "Send"
- **Close Conversation:** Click "Close Chat" when done

---

## How Visitors Get Connected

### Visitor Triggers Support Request

The floating chat widget appears on your public site with a button in the bottom-right corner.

**Visitors can request human support by saying:**
- "connect to human support"
- "speak to an agent"
- "need real person"
- "human support"
- "talk to someone"
- "support please"
- Similar variations...

### What Happens Automatically

1. **Bot detects** the support request
2. **Conversation status changes** to `waiting_support` 
3. **System message** is created for admin
4. **You see** the conversation in the admin panel
5. **You respond** via admin interface
6. **Visitor sees** your message in real-time
7. **Status changes** to `in_support`
8. **You "Close Chat"** when done

---

## Admin Workflow

### Priority Order

1. **🔴 URGENT**: Conversations with status = `waiting_support`
   - Visitor explicitly requested help
   - Respond ASAP

2. **🟡 MODERATE**: Conversations with status = `in_support`
   - You're already helping
   - Continue conversation

3. **🔵 LOW**: Conversations with status = `active`
   - Still talking to bot
   - Monitor or respond if needed

### Response Template (Recommended)

```
Hi [Visitor Name],

Thank you for reaching out! I'm [Your Name], and I'm here to help.

Could you tell me more about:
1. What specific project you're working on?
2. What's your timeline?
3. What's your budget range?

I'll be happy to recommend the best solution for you.

Best regards,
[Your Name]
```

---

## Database & API Details

### API Endpoint to Get Your Conversations

```bash
# Get conversations waiting for support
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/chatbot/conversations/?status=waiting_support

# Get in-support conversations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/chatbot/conversations/?status=in_support

# Get all conversations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/chatbot/conversations/
```

### Database Tables Created

```
chatbot_service_chatconversation
├── id (PRIMARY KEY)
├── visitor_name
├── visitor_email
├── visitor_phone
├── status (active|waiting_support|in_support|closed)
├── service_interest
├── project_description
├── budget
├── created_at
├── updated_at
└── closed_at

chatbot_service_chatmessage
├── id (PRIMARY KEY)
├── conversation_id (FOREIGN KEY)
├── message_type (visitor|bot|admin|system)
├── content
├── admin_name
└── created_at
```

---

## Common Questions

### Q: How do I set up the admin account?
**A:** First time only:
```bash
cd backend
python manage.py createsuperuser
# Follow prompts to create admin user
python manage.py runserver
# Visit http://localhost:8000/admin/
```

### Q: Can I edit existing messages?
**A:** No, messages are read-only for audit trail. You can only:
- Add new admin responses
- Close the conversation
- View full history

### Q: What if I don't respond to a waiting_support conversation?
**A:** 
- It stays in `waiting_support` status
- Visitor sees "waiting for support team" indicator
- You can respond anytime

### Q: Can visitors see my admin responses?
**A:** Yes! They see your responses in their chat widget in real-time.

### Q: How do I know when a new chat arrives?
**A:** 
- Check the admin panel regularly
- Filter by `waiting_support` status
- [Future] Enable email notifications

### Q: Can I delete conversations?
**A:** No, conversations are permanent for record-keeping. You can only close them.

---

## Keyboard Shortcuts (React Admin Only)

- **Tab** - Navigate between conversations
- **Enter** - Send reply
- **Escape** - Close conversation details

---

## Troubleshooting

### "I don't see the chat panel"
1. Make sure Django is running: `python manage.py runserver`
2. Make sure migrations were applied: `python manage.py migrate`
3. Try refreshing: `http://localhost:8000/admin/`

### "Conversation list is empty"
1. Visitors haven't used the chat widget yet
2. Check all status filters (not just Waiting for Support)
3. Check database has conversations:
   ```bash
   python manage.py shell
   >>> from chatbot_service.models import ChatConversation
   >>> ChatConversation.objects.all().count()
   ```

### "Can't log in to admin"
1. Create superuser: `python manage.py createsuperuser`
2. Make sure you're using the correct credentials
3. Check Django is running on port 8000

### "React admin not working"
1. Make sure frontend is running: `npm start`
2. Check browser console for errors (F12)
3. Make sure you're logged in to React
4. Clear browser cache and try again

---

## Security Notes

✅ **Protected**
- Admin endpoints require authentication
- Only logged-in users can see conversations
- Messages are logged and permanent

⚠️ **Best Practices**
- Don't share admin login credentials
- Treat conversation data as confidential
- Review conversations regularly
- Close completed conversations

---

## Next Steps

1. **Test the system:**
   ```bash
   bash test_chatbot.sh
   ```

2. **Access Django Admin:**
   - Go to: `http://localhost:8000/admin/`
   - Navigate to: Chatbot Service → Chat Conversations

3. **Access React Admin Panel:**
   - Go to: `http://localhost:3000/admin/chat`
   - Must be logged in

4. **Test visitor chat:**
   - Go to: `http://localhost:3000/`
   - Click floating chat button (bottom-right)
   - Say "help with cloud" or "speak to human"
   - See conversation appear in admin panel

---

## Support

For issues or questions about the chatbot implementation:
1. Check `CHATBOT_ADMIN_SETUP.md` for detailed setup
2. Review logs: `python manage.py dbshell`
3. Test API: `bash test_chatbot.sh`
4. Clear cache: `python manage.py shell` → `from django.core.cache import cache; cache.clear()`

---

**Last Updated**: 2024-12-20
**Status**: ✅ Production Ready
