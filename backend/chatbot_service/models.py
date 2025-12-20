from django.db import models
from django.utils import timezone


class ChatConversation(models.Model):
    """Store chat conversations for admin follow-up"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('waiting_support', 'Waiting for Support'),
        ('in_support', 'In Support'),
        ('closed', 'Closed'),
    ]
    
    visitor_name = models.CharField(max_length=255, null=True, blank=True)
    visitor_email = models.EmailField(null=True, blank=True)
    visitor_phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # User's intent/service interest
    service_interest = models.CharField(max_length=255, null=True, blank=True)
    project_description = models.TextField(null=True, blank=True)
    budget = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat #{self.id} - {self.status} ({self.visitor_name or 'Anonymous'})"


class ChatMessage(models.Model):
    """Individual messages in a conversation"""
    MESSAGE_TYPE_CHOICES = [
        ('visitor', 'Visitor'),
        ('bot', 'Bot'),
        ('admin', 'Admin'),
        ('system', 'System'),
    ]
    
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES)
    content = models.TextField()
    
    # For admin responses
    admin_name = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}"
