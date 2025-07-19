// Demo data script for testing messaging
import { ref, set, push, serverTimestamp } from 'firebase/database';
import { realtimeDb } from '../services/firebase';

export const createDemoData = async (user) => {
  if (!user) return;

  try {
    console.log('Creating demo chat room...');
    
    // Create a demo chat room
    const chatsRef = ref(realtimeDb, 'chats');
    const demoChatRef = push(chatsRef);
    const chatId = demoChatRef.key;

    await set(demoChatRef, {
      name: 'Welcome to ClientSync',
      type: 'project',
      description: 'This is a demo chat room to get you started!',
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

    // Add a welcome message
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const welcomeMessageRef = push(messagesRef);
    
    await set(welcomeMessageRef, {
      text: 'Welcome to ClientSync messaging! 🎉\n\nThis is your first chat room. You can:\n• Send messages in real-time\n• Create new chat rooms for different projects\n• Share files and collaborate with your team\n\nTry sending a message below!',
      senderId: 'system',
      senderName: 'ClientSync Bot',
      timestamp: serverTimestamp(),
      type: 'text'
    });

    // Update last message
    const lastMessageRef = ref(realtimeDb, `chats/${chatId}/lastMessage`);
    await set(lastMessageRef, {
      text: 'Welcome to ClientSync messaging! 🎉',
      senderId: 'system',
      senderName: 'ClientSync Bot',
      timestamp: serverTimestamp()
    });

    console.log('Demo chat room created successfully!');
    return chatId;
    
  } catch (error) {
    console.error('Error creating demo data:', error);
    return null;
  }
};

export default createDemoData;
