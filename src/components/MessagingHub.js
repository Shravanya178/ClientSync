import React, { useState } from 'react';
import { MessageCircle, Users, Settings, Sparkles } from 'lucide-react';
import ChatRoomList from './ChatRoomList';
import ChatInterface from './ChatInterface';
import { usePresence } from '../hooks/useChat';
import { createDemoData } from '../utils/demoData';

const MessagingHub = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobile, setShowMobile] = useState('list'); // 'list' or 'chat'
  
  // Set up presence tracking only if user exists
  usePresence(user);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowMobile('chat'); // Switch to chat view on mobile
  };

  // Handle back to list (mobile)
  const handleBackToList = () => {
    setShowMobile('list');
    setSelectedChat(null);
  };

  // Handle creating new chat
  const handleCreateChat = async (chatData) => {
    // This will be handled by ChatRoomList component
    console.log('Creating chat:', chatData);
  };

  // Handle creating demo chat
  const handleCreateDemo = async () => {
    try {
      const demoId = await createDemoData(user);
      if (demoId) {
        setSelectedChat({
          id: demoId,
          name: 'Welcome to ClientSync',
          type: 'project'
        });
        setShowMobile('chat');
      }
    } catch (error) {
      console.error('Error creating demo:', error);
    }
  };

  // Welcome screen component
  const WelcomeScreen = () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to ClientSync Messaging
        </h2>
        
        <p className="text-gray-600 mb-8">
          Stay connected with your team and clients in real-time. 
          Click the + button in the chat list to create your first chat room!
        </p>

        <div className="mb-6">
          <button
            onClick={handleCreateDemo}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Create Demo Chat Room
          </button>
        </div>

        <div className="mb-8">
          <button
            onClick={handleCreateDemo}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Demo Chat Room
          </button>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MessageCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Real-time Messaging</h3>
              <p className="text-sm text-gray-600">
                Send and receive messages instantly with typing indicators and read receipts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Project Channels</h3>
              <p className="text-sm text-gray-600">
                Organize conversations by project with dedicated chat rooms for focused discussions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Settings className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">File Sharing</h3>
              <p className="text-sm text-gray-600">
                Share files, images, and documents directly in your conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full">
        {showMobile === 'list' ? (
          <ChatRoomList
            user={user}
            selectedChatId={selectedChat?.id}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
          />
        ) : (
          selectedChat && (
            <ChatInterface
              chatId={selectedChat.id}
              chatName={selectedChat.name}
              chatType={selectedChat.type}
              user={user}
              onBack={handleBackToList}
            />
          )
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r border-gray-200 flex-shrink-0">
          <ChatRoomList
            user={user}
            selectedChatId={selectedChat?.id}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatInterface
              chatId={selectedChat.id}
              chatName={selectedChat.name}
              chatType={selectedChat.type}
              user={user}
              onBack={handleBackToList}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingHub;
