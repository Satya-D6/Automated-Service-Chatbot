import React, { useState, useEffect } from 'react'
import { RefreshCw, LogOut, Search, Filter, ExternalLink, Clock, User, Tag, AlertCircle } from 'lucide-react'
import { fetchAllTickets, STATE_LABELS, STATE_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../serviceNowApi.js'

const TABS = ['All', 'New', 'In Progress', 'On Hold', 'Resolved', 'Closed']
const TAB_STATES = { 'All': null, 'New': '1', 'In Progress': '2', 'On Hold': '3', 'Resolved': '6', 'Closed': '7' }

export default function Dashboard({ admin, onLogout, onSelectTicket }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const data = await fetchAllTickets()
      setTickets(data)
    } catch (e) {
      setError('Could not connect to ServiceNow. Check your network.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => load(true), 30000)
    return () => clearInterval(interval)
  }, [])

  const URGENCY_ORDER = { '1': 0, '2': 1, '3': 2, '4': 3 }

const filtered = tickets
  .filter(t => {
    const matchTab = !TAB_STATES[tab] || t.state === TAB_STATES[tab]
    const q = search.toLowerCase()
    const matchSearch = !q || t.number?.toLowerCase().includes(q) ||
      t.u_student_name?.toLowerCase().includes(q) ||
      t.u_service_type?.toLowerCase().includes(q) ||
      t.short_description?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })
  .sort((a, b) => {
    // Sort by urgency first (Critical → High → Medium → Low)
    const urgencyA = URGENCY_ORDER[a.priority] ?? 3
    const urgencyB = URGENCY_ORDER[b.priority] ?? 3
    if (urgencyA !== urgencyB) return urgencyA - urgencyB

    // If same urgency, sort by newest first
    return new Date(b.sys_created_on) - new Date(a.sys_created_on)
  })

  // Stats
  const stats = [
    { label: 'Total', count: tickets.length, color: '#4f8ef7' },
    { label: 'New', count: tickets.filter(t => t.state === '1').length, color: '#f59e0b' },
    { label: 'In Progress', count: tickets.filter(t => t.state === '2').length, color: '#06b6d4' },
    { label: 'Resolved', count: tickets.filter(t => t.state === '6').length, color: '#10b981' },
  ]

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>
            <div style={s.brandIcon}>UA</div>
            <div>
              <div style={s.brandName}>UniAssist</div>
              <div style={s.brandSub}>Admin Portal</div>
            </div>
          </div>

          <div style={s.adminCard}>
            <div style={s.adminAvatar}>{admin.avatar}</div>
            <div>
              <div style={s.adminName}>{admin.name}</div>
              <div style={s.adminDept}>{admin.dept}</div>
            </div>
          </div>

          <div style={s.sideLabel}>FILTER BY STATUS</div>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ ...s.sideBtn, ...(tab === t ? s.sideBtnActive : {}) }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: t === 'All' ? '#4f8ef7' : (STATE_COLORS[TAB_STATES[t]] || '#525972'),
                flexShrink: 0,
              }} />
              {t}
              <span style={s.sideBadge}>
                {t === 'All' ? tickets.length : tickets.filter(x => x.state === TAB_STATES[t]).length}
              </span>
            </button>
          ))}
        </div>

        <button onClick={onLogout} style={s.logoutBtn}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Service Requests</h1>
            <p style={s.headerSub}>
              Live from ServiceNow PDI · Auto-refreshes every 30s
              {refreshing && <span style={{ color: '#4f8ef7', marginLeft: 8 }}>↻ Syncing...</span>}
            </p>
          </div>
          <div style={s.headerActions}>
            <div style={s.searchBox}>
              <Search size={15} color="#525972" />
              <input
                placeholder="Search tickets, students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={s.searchInput}
              />
            </div>
            <button onClick={() => load(true)} style={s.refreshBtn} title="Refresh">
              <RefreshCw size={16} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {stats.map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statNum, color: st.color }}>{st.count}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tickets */}
        {loading ? (
          <div style={s.center}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#4f8ef7' }} />
            <p style={{ color: '#525972', marginTop: 12 }}>Loading tickets from ServiceNow...</p>
          </div>
        ) : error ? (
          <div style={s.errorBox}>
            <AlertCircle size={20} color="#ef4444" />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.center}>
            <p style={{ color: '#525972' }}>No tickets found</p>
          </div>
        ) : (
          <div style={s.ticketList}>
            {filtered.map(ticket => (
              <TicketCard key={ticket.sys_id} ticket={ticket} onClick={() => onSelectTicket(ticket)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function TicketCard({ ticket, onClick }) {
  const state = ticket.state || '1'
  const priority = ticket.priority || '3'
  const created = new Date(ticket.sys_created_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.card} className="fade-in" onClick={onClick}>
      <div style={s.cardTop}>
        <div style={s.cardLeft}>
          <span style={{ ...s.badge, background: `${STATE_COLORS[state]}18`, color: STATE_COLORS[state], borderColor: `${STATE_COLORS[state]}30` }}>
            {STATE_LABELS[state] || 'Unknown'}
          </span>
          <span style={{ ...s.badge, background: `${PRIORITY_COLORS[priority]}18`, color: PRIORITY_COLORS[priority], borderColor: `${PRIORITY_COLORS[priority]}30` }}>
            {PRIORITY_LABELS[priority] || 'Medium'}
          </span>
          {ticket.u_sentiment === 'urgent' && (
            <span style={{ ...s.badge, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
              ⚡ Urgent
            </span>
          )}
        </div>
        <span style={s.ticketNum}>{ticket.number}</span>
      </div>

      <h3 style={s.cardTitle}>{ticket.u_service_type || ticket.short_description}</h3>
      <p style={s.cardDesc}>{ticket.description?.slice(0, 120)}...</p>

      <div style={s.cardBottom}>
        <span style={s.metaItem}><User size={12} />{ticket.u_student_name || 'Unknown Student'}</span>
        <span style={s.metaItem}><Tag size={12} />{ticket.u_service_category || 'General'}</span>
        <span style={s.metaItem}><Clock size={12} />{created}</span>
        <span style={s.viewBtn}>View & Respond <ExternalLink size={11} /></span>
      </div>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 240, flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh',
  },
  sideTop: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'linear-gradient(135deg, #4f8ef7, #7c5af0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 800, color: '#fff',
  },
  brandName: { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#e8eaf0' },
  brandSub: { fontSize: '0.7rem', color: '#525972' },
  adminCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px',
    marginBottom: 20,
  },
  adminAvatar: {
    width: 34, height: 34, borderRadius: 8,
    background: 'linear-gradient(135deg, #4f8ef7, #7c5af0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  adminName: { fontSize: '0.82rem', fontWeight: 600, color: '#e8eaf0' },
  adminDept: { fontSize: '0.7rem', color: '#525972' },
  sideLabel: { fontSize: '0.65rem', fontWeight: 700, color: '#525972', letterSpacing: '0.08em', marginTop: 8, marginBottom: 4, paddingLeft: 10 },
  sideBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: 'none',
    borderRadius: 8, padding: '8px 10px',
    color: '#8891a8', fontSize: '0.82rem', textAlign: 'left',
    transition: 'all 0.15s', width: '100%',
  },
  sideBtnActive: { background: 'rgba(79,142,247,0.1)', color: '#4f8ef7' },
  sideBadge: { marginLeft: 'auto', fontSize: '0.7rem', color: '#525972', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: 8, padding: '9px 14px',
    color: '#ef4444', fontSize: '0.82rem', width: '100%',
    marginTop: 16, transition: 'all 0.15s',
  },
  main: { flex: 1, padding: '28px 32px', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  headerTitle: { fontSize: '1.6rem', fontWeight: 800, color: '#e8eaf0' },
  headerSub: { fontSize: '0.78rem', color: '#525972', marginTop: 4 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 14px',
  },
  searchInput: { background: 'transparent', border: 'none', color: '#e8eaf0', fontSize: '0.85rem', width: 200 },
  refreshBtn: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 12px', color: '#8891a8',
    display: 'flex', alignItems: 'center',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px 20px',
  },
  statNum: { fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '0.75rem', color: '#525972', marginTop: 2 },
  ticketList: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '18px 20px',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 },
  cardLeft: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: { fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid', letterSpacing: '0.02em' },
  ticketNum: { fontSize: '0.75rem', color: '#525972', fontFamily: 'monospace' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#e8eaf0', marginBottom: 6 },
  cardDesc: { fontSize: '0.8rem', color: '#8891a8', lineHeight: 1.5, marginBottom: 12 },
  cardBottom: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#525972' },
  viewBtn: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
    fontSize: '0.75rem', color: '#4f8ef7', fontWeight: 500,
  },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 8 },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 12, padding: '16px 20px', color: '#ef4444', fontSize: '0.85rem',
  },
}
