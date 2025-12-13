import React, { useEffect, useRef } from 'react';
import { type Message } from '~/types';
import MessageItem from './MessageItem';

interface ChatListProps {
  messages: Message[];
}

const ChatList: React.FC<ChatListProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatList;
