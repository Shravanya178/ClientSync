import { useState, useEffect } from 'react';
import { 
  ref, 
  push, 
  onValue, 
  off, 
  set,
  serverTimestamp,
  remove
} from 'firebase/database';
import { realtimeDb } from '../services/firebase';

export const useChat = (chatId, user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState({});

  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      setMessages([]);
      setError(null);
      setIsTyping({});
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to messages
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const unsubscribeMessages = onValue(
      messagesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const messageList = Object.entries(data)
              .map(([id, message]) => ({
                id,
                ...message,
                timestamp: message.timestamp || Date.now()
              }))
              .sort((a, b) => a.timestamp - b.timestamp)
              .slice(-50); // Keep only last 50 messages
            
            setMessages(messageList);
          } else {
            setMessages([]);
          }
          setLoading(false);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to messages:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Listen to typing indicators
    const typingRef = ref(realtimeDb, `chats/${chatId}/typing`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      const data = snapshot.val() || {};
      setIsTyping(data);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, user]);

  const sendMessage = async (messageData) => {
    if (!chatId || !user || !messageData.text?.trim()) return;

    try {
      const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        text: messageData.text,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        timestamp: serverTimestamp(),
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null
      });

      // Update last message in chat room
      const lastMessageRef = ref(realtimeDb, `chats/${chatId}/lastMessage`);
      await set(lastMessageRef, {
        text: messageData.text,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        timestamp: serverTimestamp()
      });

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const setTypingStatus = async (isTyping) => {
    if (!chatId || !user) return;

    try {
      const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${user.uid}`);
      
      if (isTyping) {
        await set(typingRef, {
          name: user.displayName || user.email || 'Anonymous',
          timestamp: serverTimestamp()
        });
      } else {
        await remove(typingRef);
      }
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    setTypingStatus
  };
};

// Hook for managing chat rooms/channels
export const useChatRooms = (user) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setChatRooms([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to user's chat rooms
    const userChatsRef = ref(realtimeDb, `users/${user.uid}/chats`);
    const unsubscribe = onValue(
      userChatsRef,
      async (snapshot) => {
        try {
          const userChatsData = snapshot.val() || {};
          const chatIds = Object.keys(userChatsData);
          
          if (chatIds.length === 0) {
            setChatRooms([]);
            setLoading(false);
            return;
          }

          // Fetch details for each chat room
          const roomPromises = chatIds.map(async (chatId) => {
            return new Promise((resolve) => {
              const chatRef = ref(realtimeDb, `chats/${chatId}`);
              onValue(chatRef, (chatSnapshot) => {
                const chatData = chatSnapshot.val();
                if (chatData) {
                  resolve({
                    id: chatId,
                    name: chatData.name,
                    type: chatData.type,
                    lastMessage: chatData.lastMessage,
                    lastActivity: chatData.lastActivity,
                    participants: chatData.participants,
                    unreadCount: userChatsData[chatId]?.unreadCount || 0
                  });
                } else {
                  resolve(null);
                }
              }, { onlyOnce: true });
            });
          });

          const rooms = await Promise.all(roomPromises);
          const validRooms = rooms
            .filter(room => room !== null)
            .sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
          
          setChatRooms(validRooms);
          setLoading(false);
        } catch (err) {
          console.error('Error loading chat rooms:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to user chats:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createChatRoom = async (roomData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create new chat room
      const chatsRef = ref(realtimeDb, 'chats');
      const newChatRef = push(chatsRef);
      const chatId = newChatRef.key;

      await set(newChatRef, {
        name: roomData.name,
        type: roomData.type || 'project',
        description: roomData.description || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        participants: {
          [user.uid]: {
            name: user.displayName || user.email || 'Anonymous',
            role: 'admin',
            joinedAt: serverTimestamp()
          }
        }
      });

      // Add chat to user's chat list
      const userChatRef = ref(realtimeDb, `users/${user.uid}/chats/${chatId}`);
      await set(userChatRef, {
        joinedAt: serverTimestamp(),
        unreadCount: 0
      });

      return chatId;
    } catch (err) {
      console.error('Error creating chat room:', err);
      throw err;
    }
  };

  return {
    chatRooms,
    loading,
    error,
    createChatRoom
  };
};

// Hook for online presence
export const usePresence = (user) => {
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!user || !user.uid) return;

    const presenceRef = ref(realtimeDb, 'presence');
    const userPresenceRef = ref(realtimeDb, `presence/${user.uid}`);

    // Set user online
    const setOnline = () => {
      set(userPresenceRef, {
        online: true,
        lastSeen: Date.now(),
        name: user.displayName || user.email || 'Anonymous'
      });
    };

    // Set user offline on disconnect
    const setOffline = () => {
      set(userPresenceRef, {
        online: false,
        lastSeen: Date.now(),
        name: user.displayName || user.email || 'Anonymous'
      });
    };

    setOnline();

    // Listen for all online users
    onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      setOnlineUsers(data);
    });

    // Handle page visibility and cleanup
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      setOffline();
      off(presenceRef);
      off(userPresenceRef);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', setOffline);
    };
  }, [user]);

  return onlineUsers;
};

const chatHooks = { useChat, useChatRooms, usePresence };
export default chatHooks;
