// Enhanced messaging hook with better error handling
import { useState, useEffect, useRef } from 'react';
import { 
  ref, 
  push, 
  onValue, 
  off, 
  serverTimestamp,
  set,
  onDisconnect
} from 'firebase/database';
import { realtimeDb } from '../services/firebase';

export const useEnhancedChat = (chatId, user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesRef = useRef();
  const typingRef = useRef();
  const presenceRef = useRef();

  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      return;
    }

    try {
      // Initialize references
      messagesRef.current = ref(realtimeDb, `chats/${chatId}/messages`);
      typingRef.current = ref(realtimeDb, `chats/${chatId}/typing`);
      presenceRef.current = ref(realtimeDb, `chats/${chatId}/presence`);

      // Listen to messages
      const handleMessages = (snapshot) => {
        try {
          if (snapshot.exists()) {
            const messagesData = snapshot.val();
            const messagesList = Object.entries(messagesData)
              .map(([key, value]) => ({ id: key, ...value }))
              .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            setMessages(messagesList);
          } else {
            setMessages([]);
          }
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError('Failed to load messages');
          setLoading(false);
        }
      };

      // Listen to typing indicators
      const handleTyping = (snapshot) => {
        try {
          if (snapshot.exists()) {
            const typingData = snapshot.val();
            setIsTyping(typingData || {});
          } else {
            setIsTyping({});
          }
        } catch (err) {
          console.error('Error processing typing data:', err);
        }
      };

      // Listen to online presence
      const handlePresence = (snapshot) => {
        try {
          if (snapshot.exists()) {
            const presenceData = snapshot.val();
            setOnlineUsers(presenceData || {});
          } else {
            setOnlineUsers({});
          }
        } catch (err) {
          console.error('Error processing presence data:', err);
        }
      };

      // Set up listeners
      onValue(messagesRef.current, handleMessages, (error) => {
        console.error('Messages listener error:', error);
        setError('Failed to connect to chat');
        setLoading(false);
      });

      onValue(typingRef.current, handleTyping, (error) => {
        console.error('Typing listener error:', error);
      });

      onValue(presenceRef.current, handlePresence, (error) => {
        console.error('Presence listener error:', error);
      });

      // Set user as online
      const userPresenceRef = ref(realtimeDb, `chats/${chatId}/presence/${user.uid}`);
      set(userPresenceRef, {
        name: user.displayName || user.email,
        online: true,
        lastSeen: serverTimestamp()
      });

      // Remove presence on disconnect
      onDisconnect(userPresenceRef).remove();

      return () => {
        // Clean up listeners
        if (messagesRef.current) off(messagesRef.current);
        if (typingRef.current) off(typingRef.current);
        if (presenceRef.current) off(presenceRef.current);
        
        // Set user as offline
        if (userPresenceRef) {
          set(userPresenceRef, {
            name: user.displayName || user.email,
            online: false,
            lastSeen: serverTimestamp()
          });
        }
      };
    } catch (err) {
      console.error('Chat initialization error:', err);
      setError('Failed to initialize chat');
      setLoading(false);
    }
  }, [chatId, user]);

  const sendMessage = async (messageData) => {
    if (!messagesRef.current || !user) return;

    try {
      const message = {
        text: messageData.text,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        type: messageData.type || 'text'
      };

      await push(messagesRef.current, message);
      
      // Clear typing indicator
      const userTypingRef = ref(realtimeDb, `chats/${chatId}/typing/${user.uid}`);
      set(userTypingRef, null);
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  };

  const setTypingStatus = async (isTyping) => {
    if (!typingRef.current || !user) return;

    try {
      const userTypingRef = ref(realtimeDb, `chats/${chatId}/typing/${user.uid}`);
      
      if (isTyping) {
        await set(userTypingRef, {
          name: user.displayName || user.email,
          timestamp: serverTimestamp()
        });
        
        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          set(userTypingRef, null);
        }, 3000);
      } else {
        await set(userTypingRef, null);
      }
    } catch (err) {
      console.error('Error setting typing status:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    isTyping,
    onlineUsers,
    sendMessage,
    setTypingStatus
  };
};

export const useChatRooms = (user) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // For now, create sample chat rooms
    const sampleRooms = [
      {
        id: 'general',
        name: 'General Discussion',
        description: 'Main project communication',
        lastMessage: 'Welcome to ClientSync messaging!',
        lastMessageTime: new Date(),
        unreadCount: 0,
        participants: [user.uid]
      },
      {
        id: 'project-updates',
        name: 'Project Updates',
        description: 'Important project announcements',
        lastMessage: 'Project milestone completed',
        lastMessageTime: new Date(Date.now() - 86400000),
        unreadCount: 2,
        participants: [user.uid]
      }
    ];

    setChatRooms(sampleRooms);
    setLoading(false);
  }, [user]);

  const createChatRoom = async (roomData) => {
    // In a real implementation, this would create a room in Firebase
    const newRoom = {
      id: `room-${Date.now()}`,
      name: roomData.name,
      description: roomData.description || '',
      lastMessage: 'Room created',
      lastMessageTime: new Date(),
      unreadCount: 0,
      participants: [user.uid, ...(roomData.participants || [])]
    };

    setChatRooms(prev => [newRoom, ...prev]);
    return newRoom;
  };

  return {
    chatRooms,
    loading,
    createChatRoom
  };
};
