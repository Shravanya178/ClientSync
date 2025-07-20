import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your project today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null); // null = loading, true/false = status
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check Gemini connection on mount
  useEffect(() => {
    const checkGeminiConnection = async () => {
      try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = process.env.REACT_APP_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const modelName = process.env.REACT_APP_GEMINI_MODEL_NAME || 'gemini-pro';
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          setIsConnected(false);
          return;
        }
        // Send a lightweight test request
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'ping' }] }]
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
      }
    };
    checkGeminiConnection();
  }, []);

  const sendMessageToGemini = async (message) => {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const apiUrl = process.env.REACT_APP_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return "AI model is not connected. Please check your Gemini API key.";
      }

      // Create context-aware prompt
      const contextualPrompt = `You are an AI assistant for ClientSync, a client project management website. This website helps manage client projects, track deliverables, deadlines, and client communications. 

Features of ClientSync:
- Dashboard with project cards showing progress
- Ticket system for client requests and issues
- Project deliverables tracking
- Client updates and notifications
- Admin comments on projects
- Email notifications for deadlines

Important: 
- Only answer questions related to ClientSync website features, project management, client work, or general business productivity
- Keep responses very short (1-2 sentences maximum)
- Do not use asterisks (*), bullet points, or formatting symbols
- Use plain text only
- If asked about unrelated topics, redirect to website features

User question: ${message}`;

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextualPrompt }] }]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "Sorry, the AI model could not answer your question. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Get AI response
    const aiResponse = await sendMessageToGemini(inputMessage);
    
    const botMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white hover:scale-110 transform`}
          aria-label="Open AI Chat Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-indigo-100">Always here to help</p>
            </div>
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {isConnected === null ? (
                <span className="text-xs text-gray-200">Checking...</span>
              ) : isConnected ? (
                <span className="flex items-center text-xs text-green-300 font-semibold">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center text-xs text-red-300 font-semibold">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-1 animate-pulse"></span>
                  Not Connected
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="w-4 h-4 mt-1 text-indigo-600" />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-1 text-white" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Always learning to help you better
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
