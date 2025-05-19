// src/components/layout/MainLayout.js
import React, { useState, useEffect } from 'react';
import Home from '../pages/Home';
// Login and Signup pages are no longer needed for forms if using Hosted UI
// import Login from '../../pages/Login';
// import Signup from '../../pages/Signup';
import Chatbot from '../pages/Chatbot'
import './MainLayout.css';
import { useAuth } from '../AuthContext';
import { signInWithRedirect } from '@aws-amplify/auth';
import { Auth } from 'aws-amplify'; // Import Auth

export default function MainLayout() {
    const [activePage, setActivePage] = useState('home');
    const { isAuthenticated, signOut, user, loading: authLoading } = useAuth();

    // Redirect to home if trying to access a protected page while not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            if (activePage === 'chat') { // 'chat' is protected
                setActivePage('home'); // Or trigger federatedSignIn directly
                // Auth.federatedSignIn(); // Optionally auto-redirect to login
            }
        }
    }, [isAuthenticated, activePage, authLoading]);

    const handleNavigation = (page) => {
        if (page === 'login' || page === 'signup') {
            if (!isAuthenticated) {
                signInWithRedirect();
            } else {
                setActivePage('home'); // If already logged in, go home
            }
        } else if (page === 'chat') {
            if (isAuthenticated) {
                setActivePage('chat');
            } else {
                console.log("Please log in to access the chatbot.");
                signInWithRedirect();
            }
        } else {
            setActivePage(page);
        }
    };

    const renderPage = () => {
        // If auth is still loading, you might want to show a general loader
        if (authLoading && !user) {
             return <div>Initializing...</div>;
        }

        switch (activePage) {
            case 'home':
                return <Home />;
            case 'chat':
                // This check is now more robust due to useEffect and handleNavigation
                return isAuthenticated ? <Chatbot /> : <Home />; // Or a message prompting login
            // No need for 'login' or 'signup' cases if they just redirect
            default:
                return <Home />;
        }
    };

    return (
        <div className="layout-container">
            <nav className="sidebar">
                <h2>☁️ Cloud AI</h2>
                {isAuthenticated && user && (
                    <p className="welcome-user">
                        Welcome, {user.attributes?.email || user.username}!
                    </p>
                )}
                <ul>
                    <li onClick={() => handleNavigation('home')}> Home</li>
                    {!isAuthenticated ? (
                        <>
                            <li onClick={() => handleNavigation('login')}> Login</li>
                            {/* Sign Up also goes to the same Hosted UI page, Cognito handles the flow */}
                            <li onClick={() => handleNavigation('signup')}> Sign Up</li>
                        </>
                    ) : (
                        <li onClick={async () => {
                            await signOut();
                            // After signout, user will be redirected to redirectSignOut URL (e.g., home)
                            // setActivePage('home'); // Not strictly necessary if redirectSignOut is set
                        }}> Logout</li>
                    )}
                    <li onClick={() => handleNavigation('chat')}>
                        Chatbot <img src="AI.svg" className='AiIcon' alt="AI Icon" />
                    </li>
                </ul>
            </nav>
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}