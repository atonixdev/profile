from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .responses import get_recommendations


class ChatbotView(APIView):
    """API endpoint for chatbot service"""
    
    def post(self, request):
        """Handle chat messages"""
        try:
            user_message = request.data.get('message', '').strip()
            
            if not user_message:
                return Response(
                    {'error': 'Message is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get chatbot response and recommendations
            recommendations = get_recommendations(user_message)
            
            return Response({
                'success': True,
                'message': recommendations['response'],
                'specialization': recommendations['specialization'],
                'technologies': recommendations['technologies'],
                'suggested_page': recommendations['suggested_page']
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
