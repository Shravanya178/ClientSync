import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Smile, 
  Phone, 
  Video,
  MoreVertical,
  ArrowLeft,
  Users,
  Hash
} from 'lucide-react';
import { useChat } from '../hooks/useChat';

const MessageBubble = ({ message, isOwnMessage, user, onReply }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.startsWith('audio/')) return '🎵';
    if (fileType?.startsWith('video/')) return '🎥';
    return '📎';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-indigo-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {!isOwnMessage && (
          <div className="text-xs font-medium mb-1 opacity-75">
            {message.senderName}
          </div>
        )}
        
        {message.replyTo && (
          <div className={`text-xs p-2 rounded mb-2 border-l-2 ${
            isOwnMessage 
              ? 'bg-indigo-500 border-indigo-300' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            Replying to previous message
          </div>
        )}

        {message.type === 'file' && (
          <div className="mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getFileIcon(message.fileType)}</span>
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                {message.fileUrl && (
                  <a 
                    href={message.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-xs underline ${
                      isOwnMessage ? 'text-indigo-200' : 'text-indigo-600'
                    }`}
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-sm">{message.text}</p>
        
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${
            isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </span>
          
          {!isOwnMessage && (
            <button
              onClick={() => onReply(message)}
              className={`text-xs px-2 py-1 rounded hover:bg-opacity-20 hover:bg-white ${
                isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = ({ typingUsers, currentUser }) => {
  const typingNames = Object.entries(typingUsers)
    .filter(([userId, data]) => userId !== currentUser.uid && data)
    .map(([_, data]) => data.name);

  if (typingNames.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm">
        {typingNames.length === 1 
          ? `${typingNames[0]} is typing...`
          : `${typingNames.length} people are typing...`
        }
      </span>
    </div>
  );
};

const MessageInput = ({ onSendMessage, disabled, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const inputRef = useRef();
  const typingTimeoutRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage({
      text: message,
      type: 'text',
      replyTo: replyTo?.id || null
    });

    setMessage('');
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleTyping = (value) => {
    setMessage(value);
    
    // Notify typing
    onTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload to Firebase Storage
    console.log('File selected:', file);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 p-4">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Replying to {replyTo.senderName}</p>
              <p className="text-sm text-gray-700">{replyTo.text}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            disabled={disabled}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="*/*"
          />
          <label
            htmlFor="file-upload"
            className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </label>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full ${
              isRecording 
                ? 'text-red-600 bg-red-100' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const ChatInterface = ({ chatId, chatName, user, onBack, chatType = 'project' }) => {
  const { messages, loading, error, isTyping, sendMessage, setTypingStatus } = useChat(chatId, user);
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageData) => {
    await sendMessage(messageData);
    setTypingStatus(false);
  };

  const handleReply = (message) => {
    // For now, just scroll to the message input
    const messageInput = document.querySelector('input[type="text"]');
    if (messageInput) {
      messageInput.focus();
      messageInput.value = `@${message.senderName} `;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Error loading chat: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            {chatType === 'project' ? (
              <Hash className="w-5 h-5 text-indigo-600" />
            ) : (
              <Users className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{chatName}</h3>
            <p className="text-sm text-gray-500">
              {chatType === 'project' ? 'Project Chat' : 'Direct Message'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user.uid}
              user={user}
              onReply={handleReply}
            />
          ))
        )}
        
        <TypingIndicator typingUsers={isTyping} currentUser={user} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={setTypingStatus}
        disabled={loading}
      />
    </div>
  );
};

export default ChatInterface;
