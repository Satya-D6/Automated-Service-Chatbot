import React from 'react';
import { CheckCheck, Ticket, ShieldCheck } from 'lucide-react';
import { getTimeString } from '../utils/botLogic';

export default function Message({ msg, onCategoryClick }) {
  const isUser = msg.sender === 'user';
  const time = msg.time || getTimeString();

  // Admin Response Card
  if (msg.adminResponse) {
    const r = msg.adminResponse;
    return (
      <div className="message-row bot">
        <div className="message-bubble" style={{ maxWidth: 360 }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid ' + r.actionColor,
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={16} color={r.actionColor} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.actionColor }}>
                Admin Response
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.68rem',
                background: r.actionColor + '33',
                color: r.actionColor,
                borderRadius: 20,
                padding: '2px 8px',
                fontWeight: 700,
              }}>
                {r.actionLabel}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontFamily: 'monospace' }}>
              Ticket: {r.ticketNumber}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
              {r.responseText}
            </p>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              {'— ' + r.adminName + ' · University Administration'}
            </div>
          </div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  }

  // Ticket Confirmation Card
  if (msg.ticketData) {
    const t = msg.ticketData;
    return (
      <div className="message-row bot">
        <div className="message-bubble">
          <p>{t.message}</p>
          <div className="ticket-card">
            <h4><Ticket size={14} /> Service Request Created</h4>
            <p>
              <span className="ticket-id">{t.ticketId}</span><br />
              Category: {t.category}<br />
              Service: {t.subcategory}<br />
              Status: <strong style={{ color: 'var(--wa-green)' }}>Assigned to Admin</strong><br />
              Est. Response: 24-48 hours
            </p>
            {t.snLink && (
              <a
                href={t.snLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 8, fontSize: '0.76rem', color: 'var(--wa-green)', textDecoration: 'underline' }}
              >
                View in ServiceNow
              </a>
            )}
          </div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  }

  // Category / Subcategory Buttons
  if (msg.options && msg.options.length > 0) {
    return (
      <div className="message-row bot">
        <div className="message-bubble">
          {msg.sentiment && (
            <div className={'sentiment-badge ' + msg.sentiment.sentiment}>
              {msg.sentiment.label}
            </div>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
          <div className="category-grid">
            {msg.options.map((opt) => (
              <button key={opt.id} className="category-btn" onClick={() => onCategoryClick(opt)}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  }

  // Media Messages
  if (msg.media) {
    return (
      <div className={'message-row ' + (isUser ? 'user' : 'bot')}>
        <div className="message-bubble">
          <div className="media-preview">
            {msg.media.type === 'image' && <img src={msg.media.url} alt="Shared" />}
            {msg.media.type === 'video' && <video src={msg.media.url} controls />}
            {msg.media.type === 'file' && (
              <div style={{ padding: 8, fontSize: '0.82rem' }}>
                {msg.media.name || 'Document'}
              </div>
            )}
          </div>
          {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
          <div className="message-time">
            {time}
            {isUser && <CheckCheck size={14} className="check" />}
          </div>
        </div>
      </div>
    );
  }

  // Audio Messages
  if (msg.audio) {
    return (
      <div className={'message-row ' + (isUser ? 'user' : 'bot')}>
        <div className="message-bubble">
          <audio src={msg.audio} controls style={{ height: 32 }} />
          <div className="message-time">
            {time}
            {isUser && <CheckCheck size={14} className="check" />}
          </div>
        </div>
      </div>
    );
  }

  // Regular Text Messages
  return (
    <div className={'message-row ' + (isUser ? 'user' : 'bot')}>
      <div className="message-bubble">
        {msg.sentiment && msg.sentiment.label && (
          <div className={'sentiment-badge ' + msg.sentiment.sentiment}>
            {msg.sentiment.label}
          </div>
        )}
        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
        <div className="message-time">
          {time}
          {isUser && <CheckCheck size={14} className="check" />}
        </div>
      </div>
    </div>
  );
}
