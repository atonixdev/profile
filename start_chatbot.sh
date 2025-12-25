#!/bin/bash

# AI Chatbot Quick Setup Script
# Run this to automatically start everything

set -e

echo "================================"
echo "AI Chatbot - Quick Setup & Start"
echo "================================"
echo ""

# Check if backend .env exists
if [ ! -f /home/atonixdev/profile/backend/.env ]; then
    echo "Creating .env file..."
    cat > /home/atonixdev/profile/backend/.env << 'EOF'
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
HUGGINGFACE_API_KEY=hf_YOUR_KEY_HERE
CORS_ALLOW_ALL_ORIGINS=True
DATABASE_URL=sqlite:///db.sqlite3
EOF
    echo "✅ .env created at /home/atonixdev/profile/backend/.env"
fi

# Check if API key is set
API_KEY=$(grep "HUGGINGFACE_API_KEY" /home/atonixdev/profile/backend/.env | cut -d'=' -f2)

if [ "$API_KEY" == "hf_YOUR_KEY_HERE" ] || [ -z "$API_KEY" ]; then
    echo ""
    echo "⚠️  IMPORTANT: Hugging Face API Key Not Set"
    echo ""
    echo "1. Go to: https://huggingface.co/settings/tokens"
    echo "2. Create a new 'read' token"
    echo "3. Copy the token (starts with hf_)"
    echo "4. Edit: /home/atonixdev/profile/backend/.env"
    echo "5. Replace: hf_YOUR_KEY_HERE with your actual key"
    echo ""
    echo "Example:"
    echo "  HUGGINGFACE_API_KEY=hf_abc123def456ghi789"
    echo ""
    read -p "Have you set your API key? (yes/no) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please set your API key first, then run this script again."
        exit 1
    fi
fi

echo ""
echo "Starting AI Chatbot..."
echo ""

# Kill any existing processes on ports 8000 and 3000
echo "Clearing ports 8000 and 3000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

echo ""
echo "Starting Backend (Django)..."
echo "================================"
cd /home/atonixdev/profile/backend
source venv/bin/activate
python manage.py migrate --noinput 2>/dev/null || true
nohup python manage.py runserver 0.0.0.0:8000 > server.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Log: tail -f /home/atonixdev/profile/backend/server.log"
sleep 2

# Verify backend is running
if curl -s http://localhost:8000/api/status/ > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend may not be responding yet (wait a moment)"
fi

echo ""
echo "Starting Frontend (React)..."
echo "================================"
cd /home/atonixdev/profile/frontend
npm install --silent > /dev/null 2>&1 || true
nohup npm start > /dev/null 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Log: tail -f /home/atonixdev/profile/frontend/nohup.out"
sleep 3

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "✅ Open http://localhost:3000 in your browser"
echo "✅ Click the chat button (bottom-right)"
echo "✅ Ask: 'Tell me about your services'"
echo ""
echo "To stop:"
echo "  kill $BACKEND_PID  # Stop backend"
echo "  kill $FRONTEND_PID # Stop frontend"
echo ""
echo "To view logs:"
echo "  tail -f /home/atonixdev/profile/backend/server.log"
echo "  tail -f /home/atonixdev/profile/frontend/nohup.out"
echo ""
