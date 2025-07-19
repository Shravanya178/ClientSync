import React, { useState, useEffect } from 'react';
import { ref, push, set, onValue } from 'firebase/database';
import { realtimeDb } from '../services/firebase';

const SimpleMessagingTest = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Basic checks first
    setDebugInfo({
      userExists: !!user,
      userEmail: user?.email,
      userId: user?.uid,
      realtimeDbExists: !!realtimeDb,
      firebaseConfigured: !!process.env.REACT_APP_FIREBASE_PROJECT_ID
    });

    if (!user) {
      setStatus('❌ No user authenticated');
      return;
    }

    if (!realtimeDb) {
      setStatus('❌ Firebase Realtime Database not initialized');
      return;
    }

    setStatus('🔄 Connecting to Firebase...');
    
    try {
      // Test Firebase connection with a simple test path
      const testRef = ref(realtimeDb, 'test/messages');
      
      const unsubscribe = onValue(testRef, 
        (snapshot) => {
          setStatus('✅ Connected to Firebase successfully!');
          const data = snapshot.val();
          if (data) {
            const messageList = Object.entries(data).map(([id, msg]) => ({
              id,
              ...msg
            }));
            setMessages(messageList);
          } else {
            setMessages([]);
          }
        },
        (error) => {
          setStatus(`❌ Firebase Error: ${error.message}`);
          console.error('Firebase connection error:', error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      setStatus(`❌ Setup Error: ${error.message}`);
      console.error('Setup error:', error);
    }
  }, [user]);

  const sendTestMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setStatus('📤 Sending message...');
      const testRef = ref(realtimeDb, 'test/messages');
      const newMsgRef = push(testRef);
      
      await set(newMsgRef, {
        text: newMessage,
        sender: user.email || 'Anonymous',
        timestamp: Date.now()
      });
      
      setNewMessage('');
      setStatus('✅ Message sent successfully!');
    } catch (error) {
      setStatus(`❌ Send Error: ${error.message}`);
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">🔧 Firebase Messaging Debug</h3>
      
      {/* Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm font-medium text-gray-700">Status:</p>
        <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
          {status}
        </p>
      </div>

      {/* Debug Information */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm font-medium text-gray-700 mb-2">Debug Info:</p>
        <div className="text-xs space-y-1">
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className={value ? 'text-green-600' : 'text-red-600'}>
                {typeof value === 'boolean' ? (value ? '✅' : '❌') : value || 'undefined'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Messages ({messages.length}):</p>
        <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet. Try sending one!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2 p-2 bg-white rounded text-sm">
                <p><strong>{msg.sender}:</strong> {msg.text}</p>
                <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a test message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
        />
        <button
          onClick={sendTestMessage}
          disabled={!newMessage.trim() || !user}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send Test
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
        <p className="font-medium text-yellow-800 mb-1">💡 Instructions:</p>
        <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Make sure you're logged in</li>
          <li>Check if all debug info shows ✅</li>
          <li>Try sending a test message</li>
          <li>Message should appear in real-time</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleMessagingTest;
