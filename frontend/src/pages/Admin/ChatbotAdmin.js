import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ChatbotAdmin = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('waiting_support');
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/chatbot/conversations/?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      alert('Failed to fetch conversations. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chatbot/conversations/${id}/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      setSelectedConversation(response.data.conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/chatbot/conversations/${selectedConversation.id}/`,
        { message: replyMessage },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSelectedConversation(response.data.conversation);
      setReplyMessage('');
      // Refresh conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/chatbot/conversations/${selectedConversation.id}/`,
        { status: 'closed' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSelectedConversation(response.data.conversation);
      fetchConversations();
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Failed to close conversation');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left Sidebar - Conversations List */}
      <div style={{
        width: '350px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
            Chat Conversations
          </h2>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedConversation(null);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="waiting_support">⏳ Waiting for Support</option>
            <option value="in_support">✅ In Support</option>
            <option value="active">💬 Active</option>
            <option value="closed">❌ Closed</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No conversations in this filter
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => fetchConversationDetail(conv.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conv.id ? '#f0f4f8' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = selectedConversation?.id === conv.id ? '#f0f4f8' : '#fafafa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = selectedConversation?.id === conv.id ? '#f0f4f8' : 'transparent'}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  {conv.visitor_name || 'Anonymous'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {conv.visitor_email}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {new Date(conv.created_at).toLocaleString()}
                </div>
                {conv.service_interest && (
                  <div style={{ fontSize: '12px', color: '#0066cc', marginTop: '4px' }}>
                    🔹 {conv.service_interest}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Conversation Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  {selectedConversation.visitor_name || 'Anonymous Visitor'}
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {selectedConversation.visitor_email} • {selectedConversation.visitor_phone || 'No phone'}
                </p>
                {selectedConversation.service_interest && (
                  <p style={{ margin: '4px 0 0 0', color: '#0066cc', fontSize: '14px' }}>
                    Interested in: {selectedConversation.service_interest}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: selectedConversation.status === 'waiting_support' ? '#fef3c7' :
                                  selectedConversation.status === 'in_support' ? '#d1fae5' :
                                  selectedConversation.status === 'closed' ? '#f3f4f6' : '#e0e7ff',
                  color: selectedConversation.status === 'waiting_support' ? '#92400e' :
                        selectedConversation.status === 'in_support' ? '#065f46' :
                        selectedConversation.status === 'closed' ? '#374151' : '#312e81'
                }}>
                  {selectedConversation.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              {selectedConversation.messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: msg.message_type === 'visitor' ? '#2563eb' :
                           msg.message_type === 'admin' ? '#16a34a' :
                           msg.message_type === 'bot' ? '#7c3aed' : '#666',
                    marginBottom: '4px'
                  }}>
                    {msg.message_type === 'visitor' ? '👤 Visitor' :
                     msg.message_type === 'admin' ? `✅ ${msg.admin_name}` :
                     msg.message_type === 'bot' ? '🤖 Bot' : '📢 System'}
                  </div>
                  <div style={{
                    backgroundColor: msg.message_type === 'admin' ? '#ecfdf5' :
                                    msg.message_type === 'visitor' ? '#eff6ff' :
                                    msg.message_type === 'bot' ? '#f5f3ff' : '#f3f4f6',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedConversation.status !== 'closed' && (
              <form onSubmit={handleSendReply} style={{
                padding: '20px',
                backgroundColor: 'white',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '8px'
              }}>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={sending || !replyMessage.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'rgb(37, 99, 235)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: sending || !replyMessage.trim() ? 'not-allowed' : 'pointer',
                      opacity: sending || !replyMessage.trim() ? 0.5 : 1,
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseConversation}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Close Chat
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            fontSize: '16px'
          }}>
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAdmin;
