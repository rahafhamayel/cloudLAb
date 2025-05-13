import React from 'react';
import '../styles.css';

export default function Signup() {
    return (
        <div className="auth-container">
            <h2>Create Account</h2>
            <form>
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
