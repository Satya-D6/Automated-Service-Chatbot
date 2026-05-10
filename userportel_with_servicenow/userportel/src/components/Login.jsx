import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    onLogin({ studentId: studentId.trim(), name: studentId.trim() });
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <GraduationCap size={36} />
        </div>
        <h1 className="login-title">UniAssist</h1>
        <p className="login-subtitle">AI-Powered University Service Portal</p>

        <div className="login-field">
          <label htmlFor="studentId">Student ID / Name</label>
          <input
            id="studentId"
            type="text"
            placeholder="Enter your Student ID or Name"
            value={studentId}
            onChange={(e) => { setStudentId(e.target.value); setError(''); }}
            autoComplete="username"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--wa-text-secondary)', cursor: 'pointer'
              }}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--wa-red)', fontSize: '0.82rem', marginBottom: 8 }}>{error}</p>
        )}

        <button type="submit" className="login-btn" id="login-submit-btn">
          Sign In to Portal
        </button>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.78rem', color: 'var(--wa-text-secondary)' }}>
          Demo: Enter any ID & password to proceed
        </p>
      </form>
    </div>
  );
}
