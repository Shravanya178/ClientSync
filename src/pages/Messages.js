import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Send,
  Search,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Users,
  MessageCircle,
  Filter
} from "lucide-react";

const Messages = ({ user, isAdminView }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('Messages component mounted with:', {
      user: user,
      isAdminView: isAdminView,
      userUid: user?.uid,
      userEmail: user?.email,
      userDisplayName: user?.displayName
    });

    // Test Firebase connection
    const testFirebaseConnection = async () => {
      try {
        console.log('Testing Firebase connection...');
        const testQuery = query(collection(db, "messages"));
        const testSnapshot = await getDocs(testQuery);
        console.log('Firebase connection successful. Total messages in database:', testSnapshot.size);
      } catch (error) {
        console.error('Firebase connection failed:', error);
      }
    };

    testFirebaseConnection();
  }, [user, isAdminView]);

  // Get conversation ID for client-admin chat
  const getConversationId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fetch admin and client users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        
        // For now, let's create mock users since real users might not exist yet
        if (isAdminView) {
          // Admin view: Create mock client users
          const mockClients = [
            {
              id: 'client1',
              displayName: 'John Doe',
              email: 'john@example.com',
              role: 'client',
              isOnline: true
            },
            {
              id: 'client2', 
              displayName: 'Jane Smith',
              email: 'jane@example.com',
              role: 'client',
              isOnline: false
            }
          ];
          setClientUsers(mockClients);
          console.log('Mock clients set:', mockClients);
        } else {
          // Client view: Create mock admin users
          const mockAdmins = [
            {
              id: 'admin1',
              displayName: 'Admin Support',
              email: 'admin@clientsync.com',
              role: 'admin',
              isOnline: true
            }
          ];
          setAdminUsers(mockAdmins);
          console.log('Mock admins set:', mockAdmins);
        }

        // Also try to fetch real users from Firestore
        try {
          const adminQuery = query(
            collection(db, "users"),
            where("role", "==", "admin")
          );
          const adminSnapshot = await getDocs(adminQuery);
          const realAdminData = adminSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isOnline: Math.random() > 0.5
          }));
          console.log('Real admins from Firestore:', realAdminData);

          if (isAdminView) {
            const clientQuery = query(
              collection(db, "users"),
              where("role", "==", "client")
            );
            const clientSnapshot = await getDocs(clientQuery);
            const realClientData = clientSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              isOnline: Math.random() > 0.5
            }));
            console.log('Real clients from Firestore:', realClientData);
            if (realClientData.length > 0) {
              setClientUsers(realClientData);
            }
          } else {
            if (realAdminData.length > 0) {
              setAdminUsers(realAdminData);
            }
          }
        } catch (firestoreError) {
          console.log('Firestore fetch failed, using mock data:', firestoreError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchUsers:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdminView]);

  // Create conversations list based on user role
  useEffect(() => {
    console.log('Creating conversations...', { isAdminView, adminUsers, clientUsers, userUid: user?.uid });
    
    if (isAdminView) {
      // Admin sees all clients
      const adminConversations = clientUsers.map(client => ({
        id: getConversationId(user?.uid || 'admin', client.id),
        userId: client.id,
        name: client.displayName || client.email,
        avatar: client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.displayName || client.email)}&background=6366f1&color=fff`,
        lastMessage: "Click to start conversation",
        lastMessageTime: new Date(),
        unreadCount: 0,
        isOnline: client.isOnline,
        type: "client",
        role: "client"
      }));
      console.log('Admin conversations created:', adminConversations);
      setConversations(adminConversations);
      if (adminConversations.length > 0) {
        setSelectedConversation(adminConversations[0]);
        console.log('Selected conversation:', adminConversations[0]);
      }
    } else {
      // Client sees admin support - Always use current user's UID
      const clientConversations = adminUsers.map(admin => ({
        id: getConversationId(user?.uid || 'user', admin.id),
        userId: admin.id,
        name: admin.displayName || "Admin Support",
        avatar: admin.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.displayName || "Admin")}&background=dc2626&color=fff`,
        lastMessage: "Click to start conversation",
        lastMessageTime: new Date(),
        unreadCount: 0,
        isOnline: admin.isOnline,
        type: "admin",
        role: "admin"
      }));
      
      // Add a default admin if no admins found - Use current user's UID
      if (clientConversations.length === 0) {
        const defaultConversation = {
          id: getConversationId(user?.uid || 'user', "admin_support"),
          userId: "admin_support",
          name: "Admin Support",
          avatar: "https://ui-avatars.com/api/?name=Admin+Support&background=dc2626&color=fff",
          lastMessage: "Click to start conversation",
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: true,
          type: "admin",
          role: "admin"
        };
        clientConversations.push(defaultConversation);
        console.log('Added default admin conversation:', defaultConversation);
      }
      
      console.log('Client conversations created:', clientConversations);
      setConversations(clientConversations);
      if (clientConversations.length > 0) {
        setSelectedConversation(clientConversations[0]);
        console.log('Selected conversation:', clientConversations[0]);
      }
    }
  }, [user?.uid, isAdminView, adminUsers, clientUsers]);

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user?.uid) {
      console.log('No selected conversation or user:', { selectedConversation, userUid: user?.uid });
      return;
    }

    console.log('Setting up message listener for conversation:', selectedConversation.id);

    // Mark messages as read function
    const markMessagesAsRead = async (conversationId) => {
      try {
        const unreadQuery = query(
          collection(db, "messages"),
          where("conversationId", "==", conversationId),
          where("senderId", "!=", user.uid),
          where("status", "!=", "read")
        );
        
        const unreadSnapshot = await getDocs(unreadQuery);
        const updatePromises = unreadSnapshot.docs.map(doc => 
          updateDoc(doc.ref, { status: "read" })
        );
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", selectedConversation.id),
      orderBy("timestamp", "asc")
    );

    console.log('Firestore query created for conversation:', selectedConversation.id);

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      console.log('Message snapshot received:', {
        empty: snapshot.empty,
        size: snapshot.size,
        conversationId: selectedConversation.id
      });

      const messageData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Message data:', data);
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          isOwn: data.senderId === user.uid // Determine if message is from current user
        };
      });
      
      console.log('Processed messages:', messageData);
      setMessages(messageData);
      
      // Mark messages as read
      markMessagesAsRead(selectedConversation.id);
    }, (error) => {
      console.error('Error in message listener:', error);
    });

    return () => {
      console.log('Cleaning up message listener');
      unsubscribe();
    };
  }, [selectedConversation, user?.uid]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      console.log('Sending message:', {
        text: newMessage.trim(),
        from: user.displayName || user.email,
        to: selectedConversation.name,
        conversationId: selectedConversation.id
      });

      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderRole: isAdminView ? "admin" : "client",
        recipientId: selectedConversation.userId,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        status: "sent",
        type: "text"
      };

      await addDoc(collection(db, "messages"), messageData);
      console.log('Message sent successfully to Firestore');
      
      // Create notification for recipient
      const notificationData = {
        userId: selectedConversation.userId,
        title: "New Message",
        message: `New message from ${user.displayName || user.email}`,
        type: "message",
        isRead: false,
        timestamp: serverTimestamp(),
        data: {
          conversationId: selectedConversation.id,
          senderId: user.uid
        }
      };

      await addDoc(collection(db, "notifications"), notificationData);
      console.log('Notification created successfully');
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = showOnlineOnly ? conv.isOnline : true;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Messages Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isAdminView ? "Client Messages" : "Admin Support"}
            </h2>
            <p className="text-sm text-gray-600">
              {isAdminView 
                ? "Communicate with your clients in real-time" 
                : "Get help and support from our admin team"
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Connected</span>
            </div>
            {isAdminView && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                Admin View
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-indigo-500" />
              Messages
            </h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`flex items-center px-3 py-1 rounded-full text-xs ${
                showOnlineOnly 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Filter className="w-3 h-3 mr-1" />
              Online only
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-indigo-50 border-r-2 border-r-indigo-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.name}
                      {conversation.type === "group" && (
                        <Users className="w-3 h-3 ml-1 inline text-gray-400" />
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full"
                />
                {selectedConversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.isOnline ? "Online" : "Last seen recently"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${
                  message.isOwn ? 'ml-12' : 'mr-12'
                }`}>
                  {/* Show sender name for messages from others */}
                  {!message.isOwn && (
                    <div className="text-xs text-gray-500 mb-1 px-2">
                      {message.senderName}
                      <span className="ml-1 text-xs px-1 py-0.5 bg-gray-100 rounded text-gray-600">
                        {message.senderRole === 'admin' ? 'Admin' : 'Client'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.isOwn ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.isOwn && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Debug Info */}
            <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
              Debug: User: {user?.displayName || user?.email || 'Not logged in'} | 
              Conversation: {selectedConversation?.id || 'None'} | 
              Role: {isAdminView ? 'Admin' : 'Client'}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
                
                {/* Test Message Button */}
                <button
                  onClick={() => {
                    setNewMessage("Hi! This is a test message.");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Messages;
