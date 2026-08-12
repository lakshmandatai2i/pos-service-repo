import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles
} from 'lucide-react';
import { CHATBOT_PRESET_QUESTIONS, getChatbotResponse } from '../data/storeData';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello Store Manager! 👋 I'm your AI Store Assistant. Ask me anything about today's sales, orders, peak hours, or food wastage.",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI thinking & response
    setTimeout(() => {
      const response = getChatbotResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        metrics: response.metrics,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Store Assistant"
      >
        <Bot size={28} />
        <span className="chatbot-fab-badge" />
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="chatbot-title">Store AI Assistant</div>
                <div className="chatbot-subtitle">Online • Real-time Store Intelligence</div>
              </div>
            </div>
            <button 
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="chat-message-bubble">
                  {msg.text}

                  {/* Render metrics if available */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="chat-metrics-grid">
                      {msg.metrics.map((m, idx) => (
                        <div key={idx} className="chat-metric-item">
                          <div className="chat-metric-label">{m.label}</div>
                          <div className="chat-metric-val">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ 
                    fontSize: '0.65rem', 
                    opacity: 0.7, 
                    textAlign: 'right', 
                    marginTop: '0.3rem' 
                  }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-message-bubble" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  AI is analyzing store records...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Questions Chips */}
          <div className="chatbot-presets">
            {CHATBOT_PRESET_QUESTIONS.map((q, idx) => (
              <button 
                key={idx} 
                className="preset-chip"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="chatbot-input-bar">
            <input 
              type="text" 
              placeholder="Ask about sales, orders, items..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              className="chatbot-send-btn"
              onClick={() => handleSendMessage()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
