import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const ChatbotAdmin = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('waiting_support');
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/chatbot/conversations/', { params: { status: filter } });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      alert('Failed to fetch conversations. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchConversationDetail = async (id) => {
    try {
      const response = await api.get(`/chatbot/conversations/${id}/`);
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
      const response = await api.post(`/chatbot/conversations/${selectedConversation.id}/`, { message: replyMessage });
      setSelectedConversation(response.data.conversation);
      setReplyMessage('');
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
      const response = await api.patch(`/chatbot/conversations/${selectedConversation.id}/`, { status: 'closed' });
      setSelectedConversation(response.data.conversation);
      fetchConversations();
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Failed to close conversation');
    }
  };

  const getStatusStyle = (status) => {
    const base = { padding: '4px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };
    if (status === 'waiting_support') return { ...base, background: '#2a1a00', border: '1px solid #FFAA00', color: '#FFAA00' };
    if (status === 'in_support') return { ...base, background: '#003311', border: '1px solid #00AA44', color: '#00AA44' };
    if (status === 'closed') return { ...base, background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#6B7280' };
    return { ...base, background: '#1F0606', border: '1px solid #A81D37', color: '#A81D37' };
  };

  const getMsgSenderStyle = (type) => {
    if (type === 'visitor') return { fontSize: '12px', fontWeight: 700, color: '#A81D37', marginBottom: '4px' };
    if (type === 'admin') return { fontSize: '12px', fontWeight: 700, color: '#00AA44', marginBottom: '4px' };
    if (type === 'bot') return { fontSize: '12px', fontWeight: 700, color: '#AA44FF', marginBottom: '4px' };
    return { fontSize: '12px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' };
  };

  const getMsgBubbleStyle = (type) => {
    const base = { padding: '12px 16px', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', borderLeft: '3px solid' };
    if (type === 'visitor') return { ...base, background: '#F8F9FA', borderLeftColor: '#A81D37' };
    if (type === 'admin') return { ...base, background: '#F8F9FA', borderLeftColor: '#00AA44' };
    if (type === 'bot') return { ...base, background: '#F8F9FA', borderLeftColor: '#AA44FF' };
    return { ...base, background: '#F8F9FA', borderLeftColor: '#D1D5DB' };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FFFFFF', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {/* Left Sidebar */}
      <div style={{ width: '320px', background: '#F8F9FA', borderRight: '1px solid #E5E7EB', overflowY: 'auto', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111827' }}>
            Chat Conversations
          </h2>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setSelectedConversation(null); }}
            style={{ width: '100%', background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '8px 12px', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="waiting_support">Waiting for Support</option>
            <option value="in_support">In Support</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>No conversations in this filter</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => fetchConversationDetail(conv.id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conv.id ? '#F1F3F5' : 'transparent',
                  borderLeft: selectedConversation?.id === conv.id ? '3px solid #A81D37' : '3px solid transparent',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '3px' }}>
                  {conv.visitor_name || 'Anonymous'}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '3px' }}>{conv.visitor_email}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{new Date(conv.created_at).toLocaleString()}</div>
                {conv.service_interest && (
                  <div style={{ fontSize: '11px', color: '#A81D37', marginTop: '4px' }}>{conv.service_interest}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedConversation ? (
          <>
            <div style={{ padding: '16px 24px', background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  {selectedConversation.visitor_name || 'Anonymous Visitor'}
                </h3>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>
                  {selectedConversation.visitor_email}{selectedConversation.visitor_phone ? ` • ${selectedConversation.visitor_phone}` : ''}
                </p>
                {selectedConversation.service_interest && (
                  <p style={{ margin: '3px 0 0 0', color: '#A81D37', fontSize: '12px' }}>
                    Interest: {selectedConversation.service_interest}
                  </p>
                )}
              </div>
              <span style={getStatusStyle(selectedConversation.status)}>
                {selectedConversation.status.replace('_', ' ')}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedConversation.messages.map((msg) => (
                <div key={msg.id}>
                  <div style={getMsgSenderStyle(msg.message_type)}>
                    {msg.message_type === 'visitor' ? 'Visitor' :
                     msg.message_type === 'admin' ? `Admin${msg.admin_name ? ': ' + msg.admin_name : ''}` :
                     msg.message_type === 'bot' ? 'Bot' : 'System'}
                  </div>
                  <div style={getMsgBubbleStyle(msg.message_type)}>{msg.content}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {selectedConversation.status !== 'closed' && (
              <form onSubmit={handleSendReply} style={{ padding: '16px 24px', background: '#F8F9FA', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px', flexShrink: 0 }}>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response..."
                  style={{ flex: 1, background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'vertical', minHeight: '60px', outline: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={sending || !replyMessage.trim()}
                    style={{ padding: '10px 20px', background: sending || !replyMessage.trim() ? '#D1D5DB' : '#A81D37', color: sending || !replyMessage.trim() ? '#6B7280' : '#fff', border: 'none', cursor: sending || !replyMessage.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseConversation}
                    style={{ padding: '10px 20px', background: 'transparent', color: '#CC0033', border: '1px solid #CC0033', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}
                  >
                    Close Chat
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', fontSize: '14px' }}>
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAdmin;
