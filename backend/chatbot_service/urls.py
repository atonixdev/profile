from django.urls import path
from .views import ChatbotView, ChatConversationListView, ChatConversationDetailView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot-chat'),
    path('conversations/', ChatConversationListView.as_view(), name='chatbot-conversations'),
    path('conversations/<int:conversation_id>/', ChatConversationDetailView.as_view(), name='chatbot-conversation-detail'),
]
