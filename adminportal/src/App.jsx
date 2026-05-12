import React, { useState, useEffect } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TicketDetail from './pages/TicketDetail.jsx'

export default function App() {
  const [admin, setAdmin] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const savedAdmin = localStorage.getItem('adminData')
    
    if (token && savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin)
        setAdmin(adminData)
      } catch (err) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminData')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Logout error:', err))
    }
    
    setAdmin(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  if (!admin) return <Login onLogin={setAdmin} />

  if (selectedTicket) return (
    <TicketDetail
      ticket={selectedTicket}
      admin={admin}
      onBack={() => setSelectedTicket(null)}
      onResponded={() => { setRefreshKey(k => k + 1); setSelectedTicket(null) }}
    />
  )

  return (
    <Dashboard
      key={refreshKey}
      admin={admin}
      onLogout={handleLogout}
      onSelectTicket={setSelectedTicket}
    />
  )
}
