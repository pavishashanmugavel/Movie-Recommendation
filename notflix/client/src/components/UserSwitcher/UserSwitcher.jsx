import React, { useState } from 'react';
import { login, signup, logout, setSession, clearSession } from '../../firebase';
import { useAppContext } from '../../context/AppContext';
import './UserSwitcher.css';

const UserSwitcher = () => {
  const { addNotification } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      addNotification('Successfully logged in', 'success');
      setEmail('');
      setPassword('');
    } catch (error) {
      addNotification(`Login failed: ${error.message}`, 'error');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      addNotification('Account created successfully', 'success');
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      addNotification(`Signup failed: ${error.message}`, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addNotification('Logged out successfully', 'info');
    } catch (error) {
      addNotification(`Logout failed: ${error.message}`, 'error');
    }
  };

  // Demo accounts for quick switching
  const demoAccounts = [
    { name: 'Alice', email: 'alice@example.com', password: 'password123' },
    { name: 'Bob', email: 'bob@example.com', password: 'password123' },
    { name: 'Charlie', email: 'charlie@example.com', password: 'password123' }
  ];

  const switchToDemoUser = async (account) => {
    try {
      // For demo purposes, we'll simulate login by setting session directly
      const user = {
        uid: `demo_${account.email.split('@')[0]}`,
        displayName: account.name,
        email: account.email
      };
      setSession('demo_token', user);
      addNotification(`Switched to ${account.name}`, 'success');
    } catch (error) {
      addNotification(`Switch failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="user-switcher">
      <h3>User Switcher</h3>
      
      {/* Demo Account Switching */}
      <div className="demo-accounts">
        <h4>Quick Switch:</h4>
        <div className="account-buttons">
          {demoAccounts.map((account, index) => (
            <button 
              key={index}
              onClick={() => switchToDemoUser(account)}
              className="demo-btn"
            >
              {account.name}
            </button>
          ))}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Manual Login/Signup */}
      <div className="manual-auth">
        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Signup</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserSwitcher;