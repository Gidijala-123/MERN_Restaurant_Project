import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hi there! I\'m Flavie, your assistant. What would you like to discuss?',
      hasActions: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (text = inputValue) => {
    const messageText = typeof text === 'string' ? text : inputValue;
    if (messageText.trim()) {
      const newUserMessage = { sender: 'user', text: messageText };
      setMessages((prev) => [...prev, newUserMessage]);
      setInputValue('');

      // Simple bot response logic
      setTimeout(() => {
        let botResponse = { sender: 'bot', text: "I'm not sure how to help with that. Try one of the options above!" };
        
        if (messageText.toLowerCase().includes('menu')) {
          botResponse = { sender: 'bot', text: 'You can see our menu below. Please choose the dish type:', hasActions: true };
        } else if (messageText.toLowerCase().includes('book')) {
          botResponse = { sender: 'bot', text: 'To book a table, please call us at +1 234 567 890 or use our online booking system.' };
        } else if (messageText.toLowerCase().includes('contact')) {
          botResponse = { sender: 'bot', text: 'You can reach our support team at support@restaurant.com.' };
        } else if (messageText.toLowerCase().includes('questions')) {
          botResponse = { sender: 'bot', text: 'Our most common questions are about opening hours (9 AM - 10 PM) and locations.' };
        }

        setMessages((prev) => [...prev, botResponse]);
      }, 600);
    }
  };

  const handleActionClick = (action) => {
    handleSendMessage(action);
  };

  const quickActions = [
    { label: 'Restaurant Menu', icon: '🥘' },
    { label: 'Book a table', icon: '📖' },
    { label: 'Basic questions', icon: '❓' },
    { label: 'Contact support', icon: '📞' },
  ];

  return (
    <>
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="bot-info">
            <div className="bot-avatar-container">
              <div className="bot-avatar">🤖</div>
              <div className="online-indicator"></div>
            </div>
            <div className="bot-name-container">
              <span className="bot-name">Flavie - Restaurant Bot</span>
              <span className="bot-status">Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={toggleChat}>
            &times;
          </button>
        </div>
        <div className="chatbot-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              {msg.sender === 'bot' && <div className="message-avatar">🤖</div>}
              <div className="message-content-container">
                {msg.sender === 'bot' && index === 0 && <div className="bot-label">Flavie</div>}
                {msg.sender === 'user' && <div className="user-label">User</div>}
                <div className="message-content">
                  {msg.text}
                  {msg.hasActions && (
                    <div className="quick-actions">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          className="action-btn"
                          onClick={() => handleActionClick(action.label)}
                        >
                          <span className="action-icon">{action.icon}</span>
                          <span className="action-label">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Send a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="send-btn" onClick={handleSendMessage}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`chatbot-fab ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
        <div className="fab-avatar">🤖</div>
        <div className="fab-dot"></div>
      </div>
    </>
  );
};

export default Chatbot;
