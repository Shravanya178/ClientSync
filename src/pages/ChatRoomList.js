import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Hash, 
  Users, 
  MessageCircle
} from 'lucide-react';
import { useChatRooms } from '../hooks/useChat';

const ChatRoomItem = ({ room, isActive, onClick, unreadCount, lastMessage }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      onClick={() => onClick(room)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-indigo-50 border-l-4 border-indigo-500' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        room.type === 'project' 
          ? 'bg-indigo-100 text-indigo-600' 
          : 'bg-green-100 text-green-600'
      }`}>
        {room.type === 'project' ? (
          <Hash className="w-5 h-5" />
        ) : (
          <Users className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium truncate ${
            isActive ? 'text-indigo-900' : 'text-gray-900'
          }`}>
            {room.name}
          </h4>
          
          {lastMessage && (
            <span className="text-xs text-gray-500 ml-2">
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500 truncate">
            {lastMessage 
              ? truncateMessage(lastMessage.text || 'File attachment')
              : 'No messages yet'
            }
          </p>
          
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        
        {room.type === 'project' && (
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">
              {room.participants?.length || 0} participants
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const NewChatModal = ({ isOpen, onClose, onCreateChat, user }) => {
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState('project');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateChat({
        name: chatName,
        type: chatType,
        description: description || null
      });
      
      setChatName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="chatType"
                  value="project"
                  checked={chatType === 'project'}
                  onChange={(e) => setChatType(e.target.value)}
                  className="mr-2"
                />
                <Hash className="w-4 h-4 mr-1" />
                Project Chat
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="chatType"
                  value="direct"
                  checked={chatType === 'direct'}
                  onChange={(e) => setChatType(e.target.value)}
                  className="mr-2"
                />
                <Users className="w-4 h-4 mr-1" />
                Direct Message
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat Name
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder={chatType === 'project' ? 'e.g., Website Redesign' : 'e.g., Client Discussion'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this chat..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!chatName.trim() || isCreating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatRoomList = ({ user, selectedChatId, onSelectChat, onCreateChat }) => {
  const { chatRooms, loading, error, createChatRoom } = useChatRooms(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, project, direct, starred

  const filteredRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || room.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateChat = async (chatData) => {
    try {
      const newChatId = await createChatRoom(chatData);
      if (newChatId) {
        onSelectChat({ 
          id: newChatId, 
          name: chatData.name,
          type: chatData.type
        });
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat room. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading chats: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mt-3">
          {[
            { key: 'all', label: 'All', icon: MessageCircle },
            { key: 'project', label: 'Projects', icon: Hash },
            { key: 'direct', label: 'Direct', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                filter === key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-4">
            {searchTerm ? (
              <p>No chats found matching "{searchTerm}"</p>
            ) : (
              <div>
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No chats yet</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Create your first chat
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                isActive={room.id === selectedChatId}
                onClick={onSelectChat}
                unreadCount={room.unreadCount || 0}
                lastMessage={room.lastMessage}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        user={user}
      />
    </div>
  );
};

export default ChatRoomList;
