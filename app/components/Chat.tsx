'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface Message {
  text: string;
  isUser: boolean;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      return;
    }

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: input }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();
      const botMessage: Message = { text: data.response, isUser: false };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[60vh] overflow-y-auto space-y-4 p-4 border rounded">
        {messages.map((message, index) => (
          <Card key={index} className={message.isUser ? 'ml-auto' : 'mr-auto'}>
            <CardContent className="p-4">
              <p>{message.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === 'Enter' && handleSendMessage()
          }
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}
