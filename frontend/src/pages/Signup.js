import React, { useState } from 'react';
import '../styles.css';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup submitted:', { fullName, email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us today and get started</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input 
            id="fullName"
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe" 
            required 
            className="auth-input"
          />
        </div>
        
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
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
            className="auth-input"
          />
          <p className="password-hint">Must be at least 8 characters</p>
        </div>
        
        <button type="submit" className="auth-button signup-button">
          Create Account
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account? <a href="#" className="auth-link">Log In</a></p>
      </div>
    </div>
  );
}