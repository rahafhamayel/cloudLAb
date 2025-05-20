import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import '../chatbot.css';
import { API } from '@aws-amplify/api-graphql';

import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { Interactions } from '@aws-amplify/interactions';

const LOG_CONVERSATION = `
  mutation LogConversation($userId: String!, $message: String!) {
    logConversation(userId: $userId, message: $message) {
      userId
      timestamp
      message
      createdAt
    }
  }
`;

const GET_CONVERSATION_HISTORY = `
  query GetConversationHistory($userId: String!) {
    getConversationHistory(userId: $userId) {
      userId
      timestamp
      message
      createdAt
    }
  }
`;

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const chatBoxRef = useRef(null);
  const botName = 'CloudAssistant';

  const fetchConversationHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.username || user?.attributes?.sub || user?.userId;
      if (!userId) throw new Error('User ID not available');

      const response = await GraphQLAPI.graphql({
      query: GET_CONVERSATION_HISTORY,
      variables: { userId }
    });

      let history = response.data.getConversationHistory || [];
      history.sort((a, b) => a.timestamp - b.timestamp);

      const formatted = history.map(item => {
        const msg = item.message;
        if (msg.startsWith('USER: ')) return { type: 'user', text: msg.substring(6) };
        if (msg.startsWith('BOT: ')) return { type: 'bot', text: msg.substring(5) };
        return { type: 'system', text: msg };
      });

      setMessages(formatted.length ? formatted : [{ type: 'bot', text: 'Hello! How can I help you today?' }]);
    } catch (err) {
      console.error('Error fetching history:', err);
      setMessages([{ type: 'bot', text: 'Hello! How can I help you today?' }]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversationHistory();
    } else {
      setMessages([{ type: 'bot', text: 'Hello! How can I help you today?' }]);
    }
  }, [isAuthenticated, user, fetchConversationHistory]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const logMessageToAPI = async (userText, botResponse) => {
    try {
      const userId = user?.username || user?.attributes?.sub || user?.userId;
      if (!userId) throw new Error('Missing user ID');

      await GraphQLAPI.graphql({ query: LOG_CONVERSATION, variables: { userId, message: `USER: ${userText}` } });
      await GraphQLAPI.graphql({ query: LOG_CONVERSATION, variables: { userId, message: `BOT: ${botResponse}` } });
    } catch (err) {
      console.error('Error logging message:', err);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMsg = { type: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await Interactions.send(botName, input.trim());

      let botReply = response.message ||
        (response.dialogState === 'Failed'
          ? "I'm sorry, I couldn't understand that. Could you try rephrasing?"
          : 'I received your message.');

      const botMsg = { type: 'bot', text: botReply };
      setMessages(prev => [...prev, botMsg]);

      if (isAuthenticated && user) {
        await logMessageToAPI(input.trim(), botReply);
      }
    } catch (err) {
      console.error('Error sending message to Lex:', err);
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">☁️ Cloud Assistant</div>
      <div className="chat-box" ref={chatBoxRef}>
        {isLoading && messages.length === 0 ? (
          <div className="loading">Loading conversation history...</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <p className="bubble">{msg.text}</p>
            </div>
          ))
        )}
        {isLoading && messages.length > 0 && (
          <div className="message bot">
            <p className="bubble typing-indicator">
              <span></span><span></span><span></span>
            </p>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || input.trim() === ''}>
          Send
        </button>
      </div>
    </div>
  );
}
