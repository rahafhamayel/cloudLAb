// Login.jsx
import React, { useState } from 'react';
import '../styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
    console.log('Login submitted:', { email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Enter your credentials to access your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" 
            required 
            className="auth-input"
          />
        </div>
        
        <div className="form-group">
          <div className="password-label-row">
            <label htmlFor="password">Password</label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>
          <input 
            id="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
            className="auth-input"
          />
        </div>
        
        <button type="submit" className="auth-button">
          Log In
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account? <a href="#" className="auth-link">Sign Up</a></p>
      </div>
    </div>
  );
}