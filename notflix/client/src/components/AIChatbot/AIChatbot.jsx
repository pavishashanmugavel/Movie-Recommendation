// src/components/AIChatbot/AIChatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import './AIChatbot.css';
import { FiMessageSquare, FiSend, FiX, FiLoader, FiTrash2 } from 'react-icons/fi';

const AIChatbot = () => {
  const { viewingHistory, myList, userProfile } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi there! I'm your NotFlix AI assistant. How can I help you with movies or TV shows today?",
      sender: 'ai'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = [
    "What should I watch next?",
    "What are some popular movies?",
    "Find movies similar to Inception",
    "What's new on NotFlix?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const context = {
        userProfile,
        viewingHistory,
        myList
      };

      const response = await aiService.generateAIResponse([...messages, userMessage], context);
      
      // Simulate typing effect
      const aiMessage = {
        id: Date.now() + 1,
        content: '',
        sender: 'ai',
        isTyping: true
      };

      setMessages(prev => [...prev, aiMessage]);

      // Simulate typing effect
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < response.length) {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            lastMessage.content = response.substring(0, i + 1);
            lastMessage.isTyping = i < response.length - 1;
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
          });
          i++;
        } else {
          clearInterval(typingInterval);
          setIsLoading(false);
        }
      }, 20);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          content: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
          sender: 'ai'
        }
      ]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        content: "Hi there! I'm your NotFlix AI assistant. How can I help you with movies or TV shows today?",
        sender: 'ai'
      }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="ai-chatbot-container">
      {!isOpen ? (
        <button
          className="ai-chatbot-toggle"
          onClick={() => setIsOpen(true)}
          title="Chat with NotFlix AI"
        >
          <FiMessageSquare size={24} />
        </button>
      ) : (
        <div className="ai-chatbot">
          <div className="ai-chatbot-header">
            <div className="header-left">
              <h3>NotFlix AI</h3>
              {userProfile?.name && (
                <span className="user-greeting">Hi, {userProfile.name}</span>
              )}
            </div>
            <div className="header-actions">
              <button
                className="clear-chat-button"
                onClick={clearChat}
                disabled={messages.length <= 1}
                title="Clear chat"
              >
                <FiTrash2 size={18} />
              </button>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="ai-chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender}`}
              >
                {message.content}
                {message.isTyping && (
                  <span className="typing-indicator">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chatbot-input-container">
            {messages.length <= 1 && (
              <div className="suggested-questions">
                <p>Try asking:</p>
                <div className="suggestion-chips">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current.focus();
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="ai-chatbot-form">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about movies or TV shows..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
              >
                {isLoading ? (
                  <FiLoader className="spinner" size={20} />
                ) : (
                  <FiSend size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;