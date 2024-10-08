'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface Message {
  text: string;
  isUser: boolean;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() === '') {
        return;
      }

      const userMessage: Message = { text: input, isUser: true };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      setStreamingMessage('');

      let completeStreamedMessage = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            previousMessages: messages,
            userMessage: input,
          }),
        });

        if (!response.ok) {
          throw new Error('Chat request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = new TextDecoder().decode(value);
          completeStreamedMessage += chunk;
          setStreamingMessage((prev) => prev + chunk);
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: completeStreamedMessage, isUser: false },
        ]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = {
          text: 'An error occurred. Please try again.',
          isUser: false,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
        setStreamingMessage('');
      }
    },
    [input],
  );

  return (
    <div className="space-y-4">
      <div className="h-[60vh] overflow-y-auto space-y-4 p-4 border rounded">
        {messages.map(
          (message, index) =>
            message.text.length > 0 && (
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
            ),
        )}
        {streamingMessage && streamingMessage.length > 0 && (
          <Card className="mr-auto bg-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">🤖 Bot</p>
              <p>{streamingMessage}</p>
            </CardContent>
          </Card>
        )}
        {isLoading && !streamingMessage && (
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
            e.key === 'Enter' && handleSendMessage(e)
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
