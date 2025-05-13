import React from 'react';
import './Home.css';

export default function Home() {
    return (
        <div className="home-welcome">
            <div className="welcome-box">
                <h1>☁️ Welcome to <span>Cloud Assistant</span></h1>
                <p>
                    Your AI-powered AWS assistant using <strong>Amazon Lex</strong> & <strong>Amplify</strong>.
                    <br />
                    Automate your cloud tasks, manage AWS services, and interact using natural language.
                </p>
            </div>
        </div>
    );
}
