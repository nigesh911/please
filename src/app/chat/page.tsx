'use client';

import { useState, useEffect } from 'react';
import { auth, database } from '../../firebase';
import { ref, push, onChildAdded, DataSnapshot } from 'firebase/database';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsername(user.displayName || user.email?.split('@')[0] || 'Anonymous');
      }
    });

    const messagesRef = ref(database, 'messages');
    onChildAdded(messagesRef, (data: DataSnapshot) => {
      const message = data.val();
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmitMessage = () => {
    if (newMessage.trim()) {
      const user = auth.currentUser;
      if (user) {
        const message: ChatMessage = {
          userId: user.uid,
          username: username,
          text: newMessage,
          timestamp: Date.now(),
        };
        push(ref(database, 'messages'), message);
        setNewMessage('');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <motion.main
        className="flex-grow p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Chat Room</h1>
        <div className="bg-card-bg p-4 rounded-lg max-h-[60vh] overflow-y-auto mb-4">
          {messages.length > 0 ? (
            <ul className="space-y-2">
              {messages.map((message, index) => (
                <li key={index} className="bg-background p-2 rounded">
                  <p className="font-semibold">{message.username}:</p>
                  <p>{message.text}</p>
                  <small className="text-secondary">
                    {new Date(message.timestamp).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages yet. Start the conversation!</p>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input flex-grow mr-2"
            placeholder="Type your message..."
          />
          <motion.button
            onClick={handleSubmitMessage}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </div>
      </motion.main>
    </div>
  );
}