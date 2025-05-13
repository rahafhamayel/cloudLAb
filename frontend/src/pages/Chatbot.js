import React, { useState } from 'react';
import '../chatbot.css';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! How can I help you today?' }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (input.trim() === '') return;

        const userMsg = { type: 'user', text: input };
        const botMsg = { type: 'bot', text: '🤖 I received your message: ' + input };

        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            setMessages(prev => [...prev, botMsg]);
        }, 800);

        setInput('');
    };

    return (
        <div className="chat-container">
            <div className="chat-header">☁️ Cloud Assistant</div>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <div className="bubble">{msg.text}</div>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
