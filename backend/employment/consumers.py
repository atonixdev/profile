"""
Employment Console — Django Channels WebSocket Consumer
Architecture §2.7 — Real-Time Event System

Handles real-time events for:
  - Interview rooms (video signaling, chat, presence)
  - Application status updates
  - Admin notifications (new submissions, decisions)

Room naming conventions:
  interview_<interview_uuid>  — Interview room (all participants)
  application_<app_uuid>      — Application feed (HR/admin)
  employment_admin            — Admin broadcast channel
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer


class InterviewConsumer(AsyncWebsocketConsumer):
    """
    Interview room WebSocket consumer.
    Powers:  real-time chat, WebRTC signaling (offer/answer/ICE),
             coding test sync, presence tracking.
    """

    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        self.room_name    = f'interview_{self.interview_id}'
        self.user         = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # Broadcast presence
        await self.channel_layer.group_send(self.room_name, {
            'type': 'presence',
            'event': 'joined',
            'user_id': self.user.id,
            'username': self.user.get_full_name() or self.user.username,
        })

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_send(self.room_name, {
                'type': 'presence',
                'event': 'left',
                'user_id': self.user.id if self.user else None,
                'username': getattr(self.user, 'username', 'unknown'),
            })
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        msg_type = data.get('type')

        # WebRTC signaling passthrough
        if msg_type in ('offer', 'answer', 'ice_candidate'):
            await self.channel_layer.group_send(self.room_name, {
                'type': 'signal',
                'signal_type': msg_type,
                'payload': data.get('payload'),
                'from_user': self.user.id,
                'target_user': data.get('target_user'),
            })

        # Chat message
        elif msg_type == 'chat':
            await self.channel_layer.group_send(self.room_name, {
                'type': 'chat_message',
                'message': data.get('message', ''),
                'from_user': self.user.id,
                'username': self.user.get_full_name() or self.user.username,
            })

        # Coding test code sync
        elif msg_type == 'code_sync':
            await self.channel_layer.group_send(self.room_name, {
                'type': 'code_update',
                'code': data.get('code', ''),
                'language': data.get('language', 'python'),
                'from_user': self.user.id,
            })

        # Coding test result
        elif msg_type == 'code_run':
            await self.channel_layer.group_send(self.room_name, {
                'type': 'code_result',
                'output': data.get('output', ''),
                'status': data.get('status', 'unknown'),
                'from_user': self.user.id,
            })

    # ── Group message handlers ────────────────────────────────

    async def signal(self, event):
        await self.send(text_data=json.dumps({
            'type': 'signal',
            'signal_type': event['signal_type'],
            'payload': event['payload'],
            'from_user': event['from_user'],
            'target_user': event.get('target_user'),
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'from_user': event['from_user'],
            'username': event['username'],
        }))

    async def code_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'code_sync',
            'code': event['code'],
            'language': event['language'],
            'from_user': event['from_user'],
        }))

    async def code_result(self, event):
        await self.send(text_data=json.dumps({
            'type': 'code_run',
            'output': event['output'],
            'status': event['status'],
            'from_user': event['from_user'],
        }))

    async def presence(self, event):
        await self.send(text_data=json.dumps({
            'type': 'presence',
            'event': event['event'],
            'user_id': event.get('user_id'),
            'username': event.get('username'),
        }))


class EmploymentAdminConsumer(AsyncWebsocketConsumer):
    """
    Admin/HR real-time feed.
    Broadcasts: new applications, status changes, interview completions, hire decisions.
    """

    ADMIN_GROUP = 'employment_admin'

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated or not self.user.is_staff:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.ADMIN_GROUP, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.ADMIN_GROUP, self.channel_name)

    async def receive(self, text_data):
        pass  # Admin feed is broadcast-only from server

    async def employment_event(self, event):
        await self.send(text_data=json.dumps({
            'type': event.get('event_name'),
            'payload': event.get('payload', {}),
        }))
