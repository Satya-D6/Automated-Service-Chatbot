import React from 'react';
import { Check, CheckCheck, Ticket } from 'lucide-react';
import { getTimeString } from '../utils/botLogic';

export default function Message({ msg, onCategoryClick }) {
  const isUser = msg.sender === 'user';
  const time = msg.time || getTimeString();

  // Render ticket confirmation card
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
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  fontSize: '0.76rem',
                  color: 'var(--wa-green)',
                  textDecoration: 'underline',
                }}
              >
                🔗 View in ServiceNow
              </a>
            )}
          </div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  }

  // Render category/subcategory buttons
  if (msg.options && msg.options.length > 0) {
    return (
      <div className="message-row bot">
        <div className="message-bubble">
          {msg.sentiment && (
            <div className={`sentiment-badge ${msg.sentiment.sentiment}`}>
              {msg.sentiment.label}
            </div>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
          <div className="category-grid">
            {msg.options.map((opt) => (
              <button
                key={opt.id}
                className="category-btn"
                onClick={() => onCategoryClick(opt)}
                id={`option-btn-${opt.id}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  }

  // Render media messages
  if (msg.media) {
    return (
      <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
        <div className="message-bubble">
          <div className="media-preview">
            {msg.media.type === 'image' && (
              <img src={msg.media.url} alt="Shared" />
            )}
            {msg.media.type === 'video' && (
              <video src={msg.media.url} controls />
            )}
            {msg.media.type === 'file' && (
              <div style={{ padding: 8, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                📄 {msg.media.name || 'Document'}
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

  // Render audio messages
  if (msg.audio) {
    return (
      <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
        <div className="message-bubble">
          <div className="audio-msg">
            <audio src={msg.audio} controls style={{ height: 32, flex: 1 }} />
          </div>
          <div className="message-time">
            {time}
            {isUser && <CheckCheck size={14} className="check" />}
          </div>
        </div>
      </div>
    );
  }

  // Render text messages
  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
      <div className="message-bubble">
        {msg.sentiment && msg.sentiment.label && (
          <div className={`sentiment-badge ${msg.sentiment.sentiment}`}>
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
