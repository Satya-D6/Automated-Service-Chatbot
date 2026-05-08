import React, { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TicketDetail from './pages/TicketDetail.jsx'

export default function App() {
  const [admin, setAdmin] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

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
      onLogout={() => setAdmin(null)}
      onSelectTicket={setSelectedTicket}
    />
  )
}
