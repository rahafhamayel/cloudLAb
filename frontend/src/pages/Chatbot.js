import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext'; // This uses your AuthContext with Amplify Auth v6 imports
import '../chatbot.css';
import { generateClient } from 'aws-amplify/api'; // Updated import for API calls
import { fetchAuthSession } from '@aws-amplify/auth';

// --- AWS SDK Imports for Lex ---
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";

// --- Lex Bot Configuration (Replace with your actual details) ---
const LEX_REGION = "ap-northeast-2"; // Your Lex bot's region
const LEX_BOT_ID = "YAB25CGPJB";      // Your Lex bot's ID
const LEX_ALIAS_ID = "TSTALIASID";    // Your Lex bot's alias ID (Verify this from console!)
const LEX_LOCALE_ID = "en_US";        // Your Lex bot's primary locale

// --- Cognito Configuration ---
// VERY IMPORTANT: This should be derived from your aws-exports.js/amplifyconfiguration.json
// Format: cognito-idp.<region>.amazonaws.com/<your_user_pool_id>
// Based on your aws_user_pools_id: "ap-northeast-2_ghgExgm6W" from your aws-exports
const COGNITO_USER_POOL_ID_DOMAIN = "cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_ghgExgm6W";
const COGNITO_IDENTITY_POOL_ID = "ap-northeast-2:2fe71ad0-edeb-4acf-97b3-2e91dce22761"; // Your identity pool ID

// --- Initialize static AWS SDK clients (outside component for efficiency) ---
const cognitoIdentityClient = new CognitoIdentityClient({ region: LEX_REGION });

// GraphQL Mutations/Queries (remain unchanged)
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
  const { user, isAuthenticated } = useAuth(); // Provides user and isAuthenticated from AuthContext
  const chatBoxRef = useRef(null);

  const lexClientRef = useRef(null);
  const [isLexClientReady, setIsLexClientReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Debug output for authentication state
  useEffect(() => {
    console.log("Auth state changed:", { 
      isAuthenticated, 
      userId: user?.username || user?.attributes?.sub,
      user: user ? JSON.stringify(user) : "No user"
    });
  }, [isAuthenticated, user]);

  // useCallback to initialize/re-initialize the Lex client when auth state changes
  const initializeLexClient = useCallback(async () => {
    setIsLexClientReady(false); // Mark as not ready while initializing
    setAuthError(null); // Clear any previous errors
    
    try {
      // Only proceed if authenticated
      if (!isAuthenticated || !user) {
        console.warn("Not authenticated - cannot initialize Lex client properly");
        setAuthError("You need to be signed in to use the chat feature.");
        return;
      }
      
      console.log("Initializing Lex client for authenticated user");
      
      // Get the current session using fetchAuthSession
      const session = await fetchAuthSession();
      const currentIdToken = session.tokens?.idToken?.toString();
      
      if (!currentIdToken) {
        throw new Error("No ID token available in current session");
      }
      
      console.log("Got valid ID token from session");
      
      // Create logins object with the ID token
      const logins = {
        [COGNITO_USER_POOL_ID_DOMAIN]: currentIdToken
      };
      
      // For debugging, log a sanitized version of the logins object
      console.log("Created logins object with provider:", 
        Object.keys(logins)[0], 
        "Token present:", !!currentIdToken);
      
      // Create a new credentials provider instance
      const credentialsProvider = fromCognitoIdentityPool({
        client: cognitoIdentityClient,
        identityPoolId: COGNITO_IDENTITY_POOL_ID,
        logins: logins,
      });
      
      console.log("Created credentials provider with identity pool:", COGNITO_IDENTITY_POOL_ID);

      // Create and store the Lex client instance
      lexClientRef.current = new LexRuntimeV2Client({
        region: LEX_REGION,
        credentials: credentialsProvider,
      });
      
      console.log("Lex client initialized successfully");
      setIsLexClientReady(true); // Mark as ready

    } catch (error) {
      console.error("Error initializing Lex client with authenticated credentials:", error);
      setAuthError(`Authentication error: ${error.message}`);
      lexClientRef.current = null; // Ensure it's null if initialization fails
      setIsLexClientReady(false);
    }
  }, [isAuthenticated, user]); // Dependencies: Re-run when auth state changes

  // Effect to re-initialize Lex client when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeLexClient();
    } else {
      setIsLexClientReady(false);
      lexClientRef.current = null;
    }
  }, [isAuthenticated, user, initializeLexClient]);

  const fetchConversationHistory = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("Not authenticated, skipping history fetch");
      setMessages([{ type: 'bot', text: 'Please sign in to use the chat feature.' }]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const userId = user?.username || user?.attributes?.sub || user?.userId;
      if (!userId) throw new Error('User ID not available');

      // Make sure we have a valid auth session before making API calls
      await fetchAuthSession();
      
      // Create a client for API calls
      const client = generateClient();
      
      console.log("Fetching conversation history for user:", userId);
      const response = await client.graphql({
        query: GET_CONVERSATION_HISTORY,
        variables: { userId },
        authMode: 'userPool' // Explicitly use user pool auth
      });

      let history = response.data.getConversationHistory || [];
history.sort((a, b) => a.timestamp - b.timestamp);

const formatted = history.map(item => {
  const msg = item.message;
  if (msg.startsWith('USER: ')) return { type: 'user', text: msg.substring(6) };
  if (msg.startsWith('BOT: ')) return { type: 'bot', text: msg.substring(5) };
  return { type: 'system', text: msg };
});

const initialMessage = { type: 'bot', text: 'Hello! How can I help you today?' };
setMessages([initialMessage, ...formatted]);

    } catch (err) {
      console.error('Error fetching history:', err.message, err.stack);
      
      // Check for auth errors
      if (err.message?.includes('not authorized') || err.message?.includes('UnauthorizedException')) {
        console.log("Authorization error when fetching history");
        setMessages([{ type: 'bot', text: 'Unable to load chat history. Please check your account permissions.' }]);
      } else {
        setMessages([{ type: 'bot', text: 'Hello! How can I help you today?' }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversationHistory();
    } else {
      setMessages([{ type: 'bot', text: isAuthenticated ? 'Hello! How can I help you today?' : 'Please sign in to use the chat feature.' }]);
    }
  }, [isAuthenticated, user, fetchConversationHistory]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const logMessageToAPI = async (userText, botResponse) => {
    if (!isAuthenticated || !user) {
      console.log("Not authenticated, skipping message logging");
      return;
    }
    
    try {
      const userId = user?.username || user?.attributes?.sub || user?.userId;
      if (!userId) throw new Error('Missing user ID');

      // Make sure we have a valid auth session before making API calls
      await fetchAuthSession();
      
      // Create a client for API calls
      const client = generateClient();
      
      // Log user message
      console.log("Logging user message for user:", userId);
      await client.graphql({
        query: LOG_CONVERSATION,
        variables: { userId, message: `USER: ${userText}` },
        authMode: 'userPool' // Explicitly use user pool auth
      });
      
      // Log bot response
      console.log("Logging bot response for user:", userId);
      await client.graphql({
        query: LOG_CONVERSATION,
        variables: { userId, message: `BOT: ${botResponse}` },
        authMode: 'userPool' // Explicitly use user pool auth
      });
      
      console.log("Successfully logged conversation");
    } catch (err) {
      console.error('Error logging message:', err.message, err.stack);
      
      // Log specific auth errors
      if (err.message?.includes('not authorized') || err.message?.includes('UnauthorizedException')) {
        console.log("Authorization error when logging message");
      }
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMsg = { type: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (!isAuthenticated || !user) {
      setMessages(prev => [...prev, { type: 'bot', text: "Please sign in to use the chat feature." }]);
      setIsLoading(false);
      return;
    }

    if (!isLexClientReady || !lexClientRef.current) {
      console.error("Lex client not initialized or ready. Cannot send message.");
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, chat service is not ready. Please try again in a moment." }]);
      setIsLoading(false);
      return;
    }

    try {
      const sessionId = user?.username || user?.attributes?.sub;
      
      if (!sessionId) {
        throw new Error("Cannot determine user session ID");
      }

      const command = new RecognizeTextCommand({
        botId: LEX_BOT_ID,
        botAliasId: LEX_ALIAS_ID,
        localeId: LEX_LOCALE_ID,
        sessionId: sessionId,
        text: input.trim(),
      });

      console.log("Sending message to Lex with session ID:", sessionId);
      const response = await lexClientRef.current.send(command);
      console.log("Received response from Lex:", response);

      let botReply = response.messages?.[0]?.content ||
        (response.interpretations?.[0]?.nluConfidence === 0 && response.dialogState === 'Failed'
          ? "I'm sorry, I couldn't understand that. Could you try rephrasing?"
          : 'I received your message.');

      const botMsg = { type: 'bot', text: botReply };
      setMessages(prev => [...prev, botMsg]);

      if (isAuthenticated && user) {
        await logMessageToAPI(input.trim(), botReply);
      }
    } catch (err) {
      console.error('Error sending message to Lex:', err);
      
      // Provide more specific error message
      let errorMessage = "Sorry, I'm having trouble connecting right now.";
      if (err.name === "AccessDeniedException") {
        errorMessage = "Authorization error. Your account may not have permission to use this chat feature.";
        // Re-initialize the client on auth errors
        initializeLexClient();
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: errorMessage }]);
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
      {authError && (
        <div className="auth-error">
          {authError}
        </div>
      )}
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
          placeholder={isAuthenticated ? "Type your message..." : "Please sign in to chat"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || !isLexClientReady || !isAuthenticated}
        />
        <button 
          onClick={sendMessage} 
          disabled={isLoading || input.trim() === '' || !isLexClientReady || !isAuthenticated}
        >
          Send
        </button>
      </div>
      {!isAuthenticated && (
        <div className="login-prompt">
          Please sign in to use the chat feature
        </div>
      )}
    </div>
  );
}