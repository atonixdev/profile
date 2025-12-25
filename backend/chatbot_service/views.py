from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .responses import get_recommendations
from .models import ChatConversation, ChatMessage
from .serializers import ChatConversationSerializer
import json


class ChatbotView(APIView):
    """API endpoint for chatbot service"""
    
    def post(self, request):
        """Handle chat messages"""
        try:
            user_message = request.data.get('message', '').strip()
            conversation_id = request.data.get('conversation_id')
            visitor_name = request.data.get('visitor_name')
            visitor_email = request.data.get('visitor_email')
            
            if not user_message:
                return Response(
                    {'error': 'Message is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create conversation
            if conversation_id:
                try:
                    conversation = ChatConversation.objects.get(id=conversation_id)
                except ChatConversation.DoesNotExist:
                    conversation = ChatConversation.objects.create(
                        visitor_name=visitor_name,
                        visitor_email=visitor_email
                    )
            else:
                conversation = ChatConversation.objects.create(
                    visitor_name=visitor_name,
                    visitor_email=visitor_email
                )
            
            # Save visitor message
            ChatMessage.objects.create(
                conversation=conversation,
                message_type='visitor',
                content=user_message
            )
            
            # Get chatbot response
            recommendations = get_recommendations(user_message)
            
            # Save bot message
            ChatMessage.objects.create(
                conversation=conversation,
                message_type='bot',
                content=recommendations['response']
            )
            
            # Handle handoff to support
            if recommendations.get('should_handoff'):
                conversation.status = 'waiting_support'
                conversation.save()
                # System message for admins
                ChatMessage.objects.create(
                    conversation=conversation,
                    message_type='system',
                    content=f"Visitor '{visitor_name}' ({visitor_email}) is waiting for support"
                )
            
            return Response({
                'success': True,
                'conversation_id': conversation.id,
                'message': recommendations['response'],
                'specialization': recommendations['specialization'],
                'technologies': recommendations['technologies'],
                'suggested_page': recommendations['suggested_page'],
                'should_handoff': recommendations.get('should_handoff', False),
                'status': conversation.status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatConversationListView(APIView):
    """API endpoint for admins to view conversations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all conversations"""
        try:
            status_filter = request.query_params.get('status')
            
            conversations = ChatConversation.objects.all()
            if status_filter:
                conversations = conversations.filter(status=status_filter)
            
            serializer = ChatConversationSerializer(conversations, many=True)
            return Response({
                'success': True,
                'conversations': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatConversationDetailView(APIView):
    """API endpoint for admin to view and respond to a conversation"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, conversation_id):
        """Get conversation details"""
        try:
            conversation = ChatConversation.objects.get(id=conversation_id)
            serializer = ChatConversationSerializer(conversation)
            return Response({
                'success': True,
                'conversation': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ChatConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, conversation_id):
        """Admin responds to conversation"""
        try:
            conversation = ChatConversation.objects.get(id=conversation_id)
            admin_message = request.data.get('message', '').strip()
            admin_name = request.user.get_full_name() or request.user.username
            
            if not admin_message:
                return Response(
                    {'error': 'Message is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save admin message
            ChatMessage.objects.create(
                conversation=conversation,
                message_type='admin',
                content=admin_message,
                admin_name=admin_name
            )
            
            # Update conversation status
            if conversation.status == 'waiting_support':
                conversation.status = 'in_support'
                conversation.save()
            
            serializer = ChatConversationSerializer(conversation)
            return Response({
                'success': True,
                'conversation': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ChatConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, conversation_id):
        """Update conversation status"""
        try:
            conversation = ChatConversation.objects.get(id=conversation_id)
            new_status = request.data.get('status')
            
            if new_status and new_status in dict(ChatConversation.STATUS_CHOICES):
                conversation.status = new_status
                if new_status == 'closed':
                    from django.utils import timezone
                    conversation.closed_at = timezone.now()
                conversation.save()
            
            serializer = ChatConversationSerializer(conversation)
            return Response({
                'success': True,
                'conversation': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ChatConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
