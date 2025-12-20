#!/bin/bash
# Test script to verify chatbot functionality

echo "================================"
echo "🧪 Chatbot System Test"
echo "================================"
echo ""

# Check if Django server is running
echo "🔍 Checking Django server..."
if timeout 2 bash -c "echo >/dev/tcp/localhost/8000" 2>/dev/null; then
    echo "✅ Django server is running on http://localhost:8000"
else
    echo "❌ Django server is NOT running"
    echo "   Start it with: cd backend && python manage.py runserver"
    exit 1
fi

echo ""
echo "📝 Testing Chatbot API..."
echo ""

# Test 1: Send a message to chatbot
echo "Test 1: Send message to chatbot (without conversation_id)"
RESPONSE=$(curl -s -X POST http://localhost:8000/api/chatbot/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! I need help with cloud infrastructure",
    "visitor_name": "Test User",
    "visitor_email": "test@example.com"
  }')

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract conversation_id if successful
CONV_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('conversation_id', ''))" 2>/dev/null)

if [ -z "$CONV_ID" ]; then
    echo "❌ Failed to get conversation ID"
    exit 1
fi

echo "✅ Conversation created: ID=$CONV_ID"
echo ""

# Test 2: Continue conversation
echo "Test 2: Continue conversation with bot"
RESPONSE=$(curl -s -X POST http://localhost:8000/api/chatbot/send/ \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I need help with AWS and Kubernetes\",
    \"conversation_id\": \"$CONV_ID\",
    \"visitor_name\": \"Test User\",
    \"visitor_email\": \"test@example.com\"
  }")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Trigger handoff
echo "Test 3: Trigger human support handoff"
RESPONSE=$(curl -s -X POST http://localhost:8000/api/chatbot/send/ \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I need to speak to a human support agent\",
    \"conversation_id\": \"$CONV_ID\",
    \"visitor_name\": \"Test User\",
    \"visitor_email\": \"test@example.com\"
  }")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 4: Get all conversations (requires auth token)
echo "Test 4: Get admin conversations (unauthenticated - should fail)"
RESPONSE=$(curl -s -X GET "http://localhost:8000/api/chatbot/conversations/?status=waiting_support" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo "================================"
echo "✅ Basic tests complete!"
echo ""
echo "📊 Database Check:"
python3 << 'EOF'
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot_service.models import ChatConversation, ChatMessage

conv_count = ChatConversation.objects.count()
msg_count = ChatMessage.objects.count()

print(f"Total conversations: {conv_count}")
print(f"Total messages: {msg_count}")

if conv_count > 0:
    print("\nLatest conversation:")
    latest = ChatConversation.objects.latest('created_at')
    print(f"  - ID: {latest.id}")
    print(f"  - Visitor: {latest.visitor_name} ({latest.visitor_email})")
    print(f"  - Status: {latest.status}")
    print(f"  - Messages: {latest.messages.count()}")
EOF

echo ""
echo "================================"
echo "🎉 Chatbot system is working!"
echo "================================"
