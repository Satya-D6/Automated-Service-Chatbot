import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Loader } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [adminId, setAdminId] = useState('')
  const [department, setDepartment] = useState('Student Services')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminData', JSON.stringify(data.admin))
        onLogin(data.admin)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error. Is backend running on port 5001?')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!fullName.trim()) {
      setError('Please enter your full name')
      setLoading(false)
      return
    }

    if (!adminId.trim()) {
      setError('Please enter your admin ID')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          adminId,
          fullName,
          department
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminData', JSON.stringify(data.admin))
        onLogin(data.admin)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Connection error. Is backend running on port 5001?')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      <div style={styles.card} className="fade-in">
        {/* Logo */}
        <div style={styles.logo}>
          <Shield size={28} color="#4f8ef7" />
        </div>
        <h1 style={styles.title}>UniAssist<br /><span style={styles.sub}>Admin Portal</span></h1>
        <p style={styles.hint}>{isSignUp ? 'Create Admin Account' : 'MongoDB Authentication'}</p>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={styles.form}>
          {isSignUp && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  required={isSignUp}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  placeholder="ADM001"
                  required={isSignUp}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={styles.input}
                >
                  <option>Student Services</option>
                  <option>Examinations</option>
                  <option>Certificates</option>
                  <option>Finance</option>
                  <option>Admissions</option>
                </select>
              </div>
            </>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...styles.input, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
              : isSignUp ? 'Sign Up →' : 'Sign In →'
            }
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div style={styles.toggleBox}>
          <p style={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              style={styles.toggleBtn}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    background: 'radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,90,240,0.06) 0%, transparent 60%)',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'rgba(15,17,23,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
  },
  logo: {
    width: 52, height: 52, borderRadius: 14,
    background: 'rgba(79,142,247,0.1)',
    border: '1px solid rgba(79,142,247,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 6,
    background: 'linear-gradient(135deg, #e8eaf0, #8891a8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: { fontSize: '1.5rem', fontWeight: 700, color: '#4f8ef7', WebkitTextFillColor: '#4f8ef7' },
  hint: { color: '#525972', fontSize: '0.8rem', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.78rem', color: '#8891a8', fontWeight: 500, letterSpacing: '0.03em' },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '11px 14px',
    color: '#e8eaf0', fontSize: '0.9rem', width: '100%',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#525972', padding: 4,
    display: 'flex', alignItems: 'center',
  },
  error: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem',
  },
  btn: {
    background: 'linear-gradient(135deg, #4f8ef7, #7c5af0)',
    border: 'none', borderRadius: 10, padding: '12px 20px',
    color: '#fff', fontWeight: 600, fontSize: '0.95rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4, transition: 'opacity 0.2s',
  },
  demoBox: {
    marginTop: 28, paddingTop: 24,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  demoBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8, padding: '8px 12px', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 10,
    transition: 'background 0.2s', cursor: 'pointer',
  },
  avatar: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg, #4f8ef7, #7c5af0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700, color: '#fff',
    flexShrink: 0,
  },
  toggleBox: {
    marginTop: 20, paddingTop: 20,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    textAlign: 'center',
  },
  toggleText: {
    fontSize: '0.85rem', color: '#8891a8', margin: 0,
  },
  toggleBtn: {
    background: 'none', border: 'none',
    color: '#4f8ef7', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.85rem',
    padding: 0, marginLeft: 4,
  },
}
