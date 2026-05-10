import React, { useState } from 'react';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
}
