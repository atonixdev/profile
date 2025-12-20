#!/bin/bash
# Chatbot Admin Setup Verification Script

echo "================================"
echo "🤖 Chatbot Admin Setup Check"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 exists"
        return 0
    else
        echo -e "${RED}❌${NC} $1 NOT FOUND"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 directory exists"
        return 0
    else
        echo -e "${RED}❌${NC} $1 NOT FOUND"
        return 1
    fi
}

echo "🔍 Checking Backend Files..."
check_file "backend/chatbot_service/models.py"
check_file "backend/chatbot_service/serializers.py"
check_file "backend/chatbot_service/views.py"
check_file "backend/chatbot_service/urls.py"
check_file "backend/chatbot_service/admin.py"
check_file "backend/chatbot_service/responses.py"
check_dir "backend/chatbot_service/migrations"

echo ""
echo "🔍 Checking Frontend Files..."
check_file "frontend/src/pages/Admin/ChatbotAdmin.js"
check_file "frontend/src/components/FloatingChatbot.js"
check_file "frontend/src/App.js"

echo ""
echo "🔍 Checking Database Migrations..."
check_file "backend/chatbot_service/migrations/0001_initial.py"

echo ""
echo "📋 Backend Configuration..."
if grep -q "chatbot_service" "backend/config/settings.py"; then
    echo -e "${GREEN}✅${NC} chatbot_service in INSTALLED_APPS"
else
    echo -e "${YELLOW}⚠️${NC} chatbot_service NOT in INSTALLED_APPS"
fi

if grep -q "chatbot" "backend/config/urls.py"; then
    echo -e "${GREEN}✅${NC} chatbot URLs configured"
else
    echo -e "${YELLOW}⚠️${NC} chatbot URLs NOT configured"
fi

echo ""
echo "📋 Frontend Configuration..."
if grep -q "ChatbotAdmin" "frontend/src/App.js"; then
    echo -e "${GREEN}✅${NC} ChatbotAdmin imported in App.js"
else
    echo -e "${YELLOW}⚠️${NC} ChatbotAdmin NOT imported"
fi

if grep -q "/admin/chat" "frontend/src/App.js"; then
    echo -e "${GREEN}✅${NC} /admin/chat route configured"
else
    echo -e "${YELLOW}⚠️${NC} /admin/chat route NOT configured"
fi

echo ""
echo "================================"
echo "📝 Next Steps:"
echo "================================"
echo ""
echo "1️⃣  Apply Database Migrations:"
echo "   cd backend"
echo "   python manage.py migrate"
echo ""
echo "2️⃣  Start Django Server:"
echo "   python manage.py runserver"
echo ""
echo "3️⃣  Start React Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4️⃣  Access Admin Chat Panel:"
echo "   http://localhost:3000/admin/chat"
echo ""
echo "5️⃣  Or use Django Admin:"
echo "   http://localhost:8000/admin/chatbot_service/chatconversation/"
echo ""
echo "================================"
echo "✨ Setup complete!"
echo "================================"
