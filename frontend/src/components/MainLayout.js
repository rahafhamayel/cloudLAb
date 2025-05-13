import React, { useState } from 'react';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Chatbot from '../pages/Chatbot';
import './MainLayout.css';

export default function MainLayout() {
    const [activePage, setActivePage] = useState('home');

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return <Home />;
            case 'login':
                return <Login />;
            case 'signup':
                return <Signup />;
            case 'chat':
                return <Chatbot />;
            default:
                return <Home />;
        }
    };

    return (
        <div className="layout-container">
            <nav className="sidebar">
                <h2>☁️ Cloud AI</h2>
                <ul>
                    <li onClick={() => setActivePage('home')}> Home</li>
                    <li onClick={() => setActivePage('login')}> Login</li>
                    <li onClick={() => setActivePage('signup')}> Sign Up</li>
                    <li onClick={() => setActivePage('chat')}>🤖 Chatbot</li>
                </ul>
            </nav>
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}
