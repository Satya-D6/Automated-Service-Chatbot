import React, { useState, useRef } from 'react';
import { Paperclip, Camera, Mic, Send, Smile, Image, FileText, X } from 'lucide-react';

export default function ChatInput({ onSendText, onSendMedia, onSendAudio, onOpenCamera }) {
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);

  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const emojis = ['😊', '👍', '🙏', '📎', '✅', '❌', '⚡', '🎓', '📄', '💬', '🔔', '📝'];

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // File attachment handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
    onSendMedia({ type, url, name: file.name });
    setShowAttach(false);
    e.target.value = '';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSendMedia({ type: 'image', url, name: file.name });
    setShowAttach(false);
    e.target.value = '';
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onSendAudio(url);
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setRecordTime(0);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) {
      // Fallback: create a mock audio message
      const mockAudioUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      onSendAudio(mockAudioUrl);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    clearInterval(timerRef.current);
    setRecordTime(0);
    setIsRecording(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Voice recording overlay
  if (isRecording) {
    return (
      <div className="voice-recording-bar">
        <div className="rec-dot" />
        <div className="audio-wave-bars">
          <span /><span /><span /><span /><span />
        </div>
        <span className="rec-timer">{formatTime(recordTime)}</span>
        <button className="btn-cancel-rec" onClick={cancelRecording}>
          <X size={16} style={{ marginRight: 4 }} /> Cancel
        </button>
        <button className="btn-send-rec" onClick={stopRecording}>
          <Send size={16} style={{ marginRight: 4 }} /> Send
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Attachment Menu */}
      {showAttach && (
        <div className="attach-menu">
          <button onClick={() => { imgRef.current?.click(); }}>
            <Image size={18} /> Photo & Video
          </button>
          <button onClick={() => { onOpenCamera(); setShowAttach(false); }}>
            <Camera size={18} /> Camera
          </button>
          <button onClick={() => { fileRef.current?.click(); }}>
            <FileText size={18} /> Document
          </button>
        </div>
      )}

      {/* Emoji Row */}
      {showEmojis && (
        <div style={{
          position: 'absolute', bottom: 62, left: 12, background: 'var(--wa-panel)',
          borderRadius: 'var(--radius-md)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          padding: '8px 10px', zIndex: 20, border: '1px solid var(--wa-border)',
          animation: 'slideUp 0.2s ease'
        }}>
          <div className="emoji-row">
            {emojis.map((em) => (
              <button key={em} className="emoji-btn" onClick={() => { setText(t => t + em); setShowEmojis(false); }}>
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input-bar">
        <div className="input-actions">
          <button onClick={() => setShowEmojis(!showEmojis)} title="Emoji" id="emoji-btn">
            <Smile size={22} />
          </button>
          <button onClick={() => { setShowAttach(!showAttach); setShowEmojis(false); }} title="Attach" id="attach-btn">
            <Paperclip size={22} />
          </button>
        </div>

        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            id="message-input"
          />
        </div>

        {text.trim() ? (
          <button className="send-btn active" onClick={handleSend} title="Send" id="send-btn">
            <Send size={22} />
          </button>
        ) : (
          <button className="send-btn" onClick={startRecording} title="Voice message" id="mic-btn">
            <Mic size={22} />
          </button>
        )}

        {/* Hidden file inputs */}
        <input ref={fileRef} type="file" hidden onChange={handleFileSelect} />
        <input ref={imgRef} type="file" hidden accept="image/*,video/*" onChange={handleImageSelect} />
      </div>
    </div>
  );
}
