'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface ChatSectionProps {
  movieId: number;
}

const ChatSection: React.FC<ChatSectionProps> = ({ movieId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // Remove the unused 'username' state
  // const [username, setUsername] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      // This callback is now empty
    });

    if (typeof window !== 'undefined') {
      const storedMessages = JSON.parse(localStorage.getItem(`chat_${movieId}`) || '[]');
      setMessages(storedMessages);
    }

    return () => unsubscribe();
  }, [movieId]);

  const handleSubmitMessage = () => {
    if (newMessage.trim() && typeof window !== 'undefined') {
      const user = auth.currentUser;
      if (user) {
        const message: ChatMessage = {
          userId: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          text: newMessage,
          timestamp: Date.now(),
        };
        const updatedMessages = [...messages, message];
        setMessages(updatedMessages);
        localStorage.setItem(`chat_${movieId}`, JSON.stringify(updatedMessages));
        setNewMessage('');
      }
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-2">Chat</h4>
      <div className="bg-background p-4 rounded-lg max-h-60 overflow-y-auto mb-4">
        {messages.length > 0 ? (
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li key={index} className="bg-card-bg p-2 rounded">
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
    </div>
  );
};

export default ChatSection;