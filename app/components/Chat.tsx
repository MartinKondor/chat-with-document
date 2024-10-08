'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      return;
    }

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

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
      const errorMessage: Message = {
        text: 'An error occurred. Please try again.',
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[60vh] overflow-y-auto space-y-4 p-4 border rounded">
        {messages.map((message, index) => (
          <Card
            key={index}
            className={message.isUser ? 'ml-auto' : 'mr-auto bg-gray-200'}
          >
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">
                {message.isUser ? '😀 You' : '🤖 Bot'}
              </p>
              <p>{message.text}</p>
            </CardContent>
          </Card>
        ))}
        {isLoading && (
          <Card className="mr-auto bg-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">🤖 Bot</p>
              <p>Thinking...</p>
            </CardContent>
          </Card>
        )}
        <div ref={messagesEndRef} />
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
        <Button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
}
