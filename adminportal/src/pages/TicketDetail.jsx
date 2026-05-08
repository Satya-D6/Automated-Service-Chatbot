import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Clock, MessageSquare, Send, ExternalLink, User, Calendar, Tag, AlertTriangle } from 'lucide-react'
import { sendResponse, STATE_LABELS, STATE_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../serviceNowApi.js'

const SN_BASE = 'https://dev328681.service-now.com'

const ACTIONS = [
  { key: 'progress',  label: '🔄 Mark In Progress', color: '#06b6d4', desc: 'Start working on this request' },
  { key: 'approve',   label: '✅ Approve & Resolve',  color: '#10b981', desc: 'Request fulfilled, mark resolved' },
  { key: 'hold',      label: '⏸ Put On Hold',         color: '#8b5cf6', desc: 'Waiting for more information' },
  { key: 'reject',    label: '❌ Reject Request',       color: '#ef4444', desc: 'Cannot process this request' },
]

export default function TicketDetail({ ticket, admin, onBack, onResponded }) {
  const [action, setAction] = useState('progress')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const state = ticket.state || '1'
  const priority = ticket.priority || '3'
  const created = new Date(ticket.sys_created_on).toLocaleString('en-IN')
  const updated = new Date(ticket.sys_updated_on).toLocaleString('en-IN')

  const handleSend = async () => {
    if (!message.trim()) { setError('Please write a response message.'); return }
    setSending(true)
    setError('')
    try {
      await sendResponse(ticket.sys_id, {
        responseText: message,
        newState: action,
        adminName: admin.name,
      })
      setSent(true)
      setTimeout(() => { onResponded(); onBack() }, 1800)
    } catch (e) {
      setError('Failed to send response: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <a
          href={`${SN_BASE}/nav_to.do?uri=u_university_request.do?sys_id=${ticket.sys_id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={s.snLink}
        >
          Open in ServiceNow <ExternalLink size={13} />
        </a>
      </div>

      <div style={s.layout}>
        {/* Left — Ticket Info */}
        <div style={s.leftCol}>
          <div style={s.card}>
            {/* Ticket header */}
            <div style={s.ticketTop}>
              <div style={s.ticketNum}>{ticket.number}</div>
              <div style={s.badges}>
                <span style={{ ...s.badge, background: `${STATE_COLORS[state]}18`, color: STATE_COLORS[state], borderColor: `${STATE_COLORS[state]}30` }}>
                  {STATE_LABELS[state]}
                </span>
                <span style={{ ...s.badge, background: `${PRIORITY_COLORS[priority]}18`, color: PRIORITY_COLORS[priority], borderColor: `${PRIORITY_COLORS[priority]}30` }}>
                  {PRIORITY_LABELS[priority]}
                </span>
                {ticket.u_sentiment === 'urgent' && (
                  <span style={{ ...s.badge, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                    ⚡ Urgent
                  </span>
                )}
              </div>
            </div>

            <h2 style={s.title}>{ticket.u_service_type || ticket.short_description}</h2>
            <p style={s.desc}>{ticket.description}</p>

            {/* Meta grid */}
            <div style={s.metaGrid}>
              {[
                { icon: <User size={14} />, label: 'Student', value: ticket.u_student_name || 'Unknown' },
                { icon: <Tag size={14} />, label: 'Student ID', value: ticket.u_student_id || 'N/A' },
                { icon: <Tag size={14} />, label: 'Category', value: ticket.u_service_category || 'General' },
                { icon: <Tag size={14} />, label: 'Service Type', value: ticket.u_service_type || 'N/A' },
                { icon: <Calendar size={14} />, label: 'Submitted', value: created },
                { icon: <Calendar size={14} />, label: 'Last Updated', value: updated },
              ].map(m => (
                <div key={m.label} style={s.metaItem}>
                  <div style={s.metaLabel}>{m.icon} {m.label}</div>
                  <div style={s.metaValue}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment note */}
          {ticket.u_sentiment && ticket.u_sentiment !== 'neutral' && (
            <div style={{ ...s.sentimentBox, background: ticket.u_sentiment === 'urgent' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', borderColor: ticket.u_sentiment === 'urgent' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)' }}>
              <AlertTriangle size={15} color={ticket.u_sentiment === 'urgent' ? '#ef4444' : '#f59e0b'} />
              <span style={{ color: ticket.u_sentiment === 'urgent' ? '#ef4444' : '#f59e0b', fontSize: '0.82rem' }}>
                Student sentiment detected as <strong>{ticket.u_sentiment}</strong> — handle with priority.
              </span>
            </div>
          )}
        </div>

        {/* Right — Response Panel */}
        <div style={s.rightCol}>
          <div style={s.card}>
            <h3 style={s.responseTitle}>
              <MessageSquare size={16} color="#4f8ef7" />
              Respond to Student
            </h3>
            <p style={s.responseHint}>
              Your response will be saved in ServiceNow and the student will see it in their UniAssist chat portal.
            </p>

            {/* Action selection */}
            <div style={s.actionGrid}>
              {ACTIONS.map(a => (
                <button
                  key={a.key}
                  onClick={() => setAction(a.key)}
                  style={{
                    ...s.actionBtn,
                    ...(action === a.key ? { border: `1px solid ${a.color}40`, background: `${a.color}12`, color: a.color } : {}),
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{a.desc}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <div style={s.field}>
              <label style={s.fieldLabel}>Response Message <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Dear ${ticket.u_student_name || 'Student'},\n\nWrite your response here...\n\nThis message will appear directly in their UniAssist chat.`}
                rows={7}
                style={s.textarea}
              />
              <div style={{ fontSize: '0.72rem', color: '#525972', marginTop: 4 }}>
                {message.length} characters
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>
                <XCircle size={15} color="#ef4444" /> {error}
              </div>
            )}

            {sent && (
              <div style={s.successBox}>
                <CheckCircle size={15} color="#10b981" />
                Response sent! Ticket updated in ServiceNow. Student will see it in their chat. Redirecting...
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || sent || !message.trim()}
              style={s.sendBtn}
            >
              {sending
                ? <><Clock size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                : sent
                  ? <><CheckCircle size={15} /> Sent!</>
                  : <><Send size={15} /> Send Response to Student</>
              }
            </button>

            <p style={s.sendNote}>
              💡 This will update the ServiceNow ticket state to "<strong>{ACTIONS.find(a => a.key === action)?.label}</strong>" and post your message as a comment visible to the student.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', padding: '24px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 14px', color: '#8891a8', fontSize: '0.83rem',
  },
  snLink: {
    display: 'flex', alignItems: 'center', gap: 6,
    color: '#4f8ef7', fontSize: '0.82rem', textDecoration: 'none',
    background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)',
    borderRadius: 8, padding: '8px 14px',
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  rightCol: {},
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '24px',
  },
  ticketTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 },
  ticketNum: { fontFamily: 'monospace', color: '#525972', fontSize: '0.85rem' },
  badges: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: { fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid', letterSpacing: '0.02em' },
  title: { fontSize: '1.2rem', fontWeight: 700, color: '#e8eaf0', marginBottom: 10 },
  desc: { fontSize: '0.85rem', color: '#8891a8', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 20 },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  metaItem: { background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' },
  metaLabel: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#525972', marginBottom: 4 },
  metaValue: { fontSize: '0.83rem', color: '#e8eaf0', fontWeight: 500 },
  sentimentBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: '1px solid', borderRadius: 10, padding: '12px 16px',
  },
  responseTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
    color: '#e8eaf0', marginBottom: 6,
  },
  responseHint: { fontSize: '0.78rem', color: '#525972', lineHeight: 1.5, marginBottom: 18 },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 },
  actionBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 12px', textAlign: 'left',
    color: '#8891a8', transition: 'all 0.15s',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  fieldLabel: { fontSize: '0.78rem', color: '#8891a8', fontWeight: 500 },
  textarea: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', color: '#e8eaf0',
    fontSize: '0.85rem', resize: 'vertical', lineHeight: 1.6, width: '100%',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem', marginBottom: 12,
  },
  successBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 8, padding: '10px 14px', color: '#10b981', fontSize: '0.82rem', marginBottom: 12,
  },
  sendBtn: {
    width: '100%', background: 'linear-gradient(135deg, #4f8ef7, #7c5af0)',
    border: 'none', borderRadius: 10, padding: '12px 20px',
    color: '#fff', fontWeight: 600, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 12, transition: 'opacity 0.2s',
  },
  sendNote: { fontSize: '0.73rem', color: '#525972', lineHeight: 1.5 },
}
