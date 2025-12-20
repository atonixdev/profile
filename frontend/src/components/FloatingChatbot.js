import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 I'm here to help you find the perfect services and technology solutions. What project or challenge are you working on?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('FloatingChatbot mounted');
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chatbot/chat/`,
        { message: inputValue },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.message,
        specialization: response.data.specialization,
        technologies: response.data.technologies,
        suggested_page: response.data.suggested_page,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "Sorry, I encountered an error. Please try again or contact us directly!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(147, 51, 234) 100%)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '28px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        title="Chat with us"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '384px',
            maxHeight: '600px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(147, 51, 234) 100%)',
            color: 'white',
            padding: '16px',
            flex: '0 0 auto'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Expert Assistant
            </h3>
            <p style={{ margin: '0', fontSize: '12px', opacity: 0.9 }}>
              Ask about our services & expertise
            </p>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f9fafb'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.type === 'user' ? 'rgb(37, 99, 235)' : 'white',
                    color: msg.type === 'user' ? 'white' : 'rgb(17, 24, 39)',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    border: msg.type === 'bot' ? '1px solid rgb(229, 231, 235)' : 'none'
                  }}
                >
                  <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  
                  {msg.technologies && msg.technologies.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', opacity: 0.7 }}>
                        Related Technologies:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {msg.technologies.slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              backgroundColor: 'rgb(229, 231, 235)',
                              color: 'rgb(55, 65, 81)',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                        {msg.technologies.length > 5 && (
                          <span style={{ fontSize: '11px', color: 'rgb(107, 114, 128)' }}>
                            +{msg.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.suggested_page && (
                    <div style={{ marginTop: '12px' }}>
                      <a
                        href={`/${msg.suggested_page.toLowerCase()}`}
                        style={{
                          fontSize: '12px',
                          textDecoration: 'underline',
                          opacity: 0.7,
                          color: 'inherit'
                        }}
                      >
                        View {msg.suggested_page} →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgb(229, 231, 235)'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'rgb(156, 163, 175)',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite'
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'rgb(156, 163, 175)',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite',
                      animationDelay: '0.2s'
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'rgb(156, 163, 175)',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite',
                      animationDelay: '0.4s'
                    }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid rgb(229, 231, 235)',
            padding: '12px',
            backgroundColor: 'white',
            flex: '0 0 auto'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about our services..."
                disabled={isLoading}
                style={{
                  flex: '1',
                  border: '1px solid rgb(209, 213, 219)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  backgroundColor: 'rgb(37, 99, 235)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.5; }
          40% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default FloatingChatbot;
