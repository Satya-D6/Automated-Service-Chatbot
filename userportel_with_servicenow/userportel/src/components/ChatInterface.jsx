import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Phone, Video, LogOut } from 'lucide-react';
import Message from './Message';
import ChatInput from './ChatInput';
import CameraModal from './CameraModal';
import {
  CATEGORIES, analyzeSentiment, getBotGreeting, getSubcategoryPrompt,
  getDocumentPrompt, getSentimentResponse, getTicketConfirmation, getTimeString,
} from '../utils/botLogic';
import { createServiceNowTicket } from '../utils/serviceNowApi';
import { ResponsePoller, ACTION_LABELS, ACTION_COLORS } from '../utils/adminResponsePoller';

export default function ChatInterface({ user, onLogout }) {
  const [messages, setMessages]     = useState([]);
  const [isTyping, setIsTyping]     = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [workflow, setWorkflow]     = useState({ step: 'greeting', category: null, subcategory: null });
  const messagesEndRef              = useRef(null);
  const pollersRef                  = useRef([]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const greetedRef = useRef(false);

  useEffect(() => {
    if (!greetedRef.current) {
      greetedRef.current = true;
      sendBotMessage(getBotGreeting(user.name), CATEGORIES);
    }
    return () => pollersRef.current.forEach(p => p.stop());
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, time: getTimeString() }]);
  }, []);

  const sendBotMessage = useCallback((text, options = null, extra = {}) => {
    setIsTyping(true);
    const delay = Math.min(800 + text.length * 8, 2200);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ sender: 'bot', text, options, ...extra });
    }, delay);
  }, [addMessage]);

  // ── Start polling for admin response ──────────────────────────
  const startPollingForResponse = useCallback((ticketNumber) => {
    console.log('[ChatInterface] Starting poller for ticket:', ticketNumber);

    const poller = new ResponsePoller(ticketNumber, (response) => {
      console.log('[ChatInterface] Admin response received:', response);
      console.log('[ChatInterface] Attachments received:', response.attachments);

      const actionLabel = ACTION_LABELS[response.u_action] || '📋 Responded';
      const actionColor = ACTION_COLORS[response.u_action] || '#4f8ef7';

      // Add admin response as a message in the chat
      // attachments array is passed so Message.jsx can show download buttons
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          time: getTimeString(),
          adminResponse: {
            ticketNumber:  response.u_ticket_number,
            adminName:     response.u_admin_name,
            responseText:  response.u_response_text,
            action:        response.u_action,
            actionLabel,
            actionColor,
            attachments:   response.attachments || [],
          },
        },
      ]);

      // Stop polling if resolved or rejected
      if (response.u_action === 'approve' || response.u_action === 'reject') {
        poller.stop();
      }
    });

    poller.start();
    pollersRef.current.push(poller);
  }, []);

  // ── Submit ticket to ServiceNow ───────────────────────────────
  const submitToServiceNow = useCallback(async (description, sentiment) => {
    const catLabel = workflow.category?.label?.replace(/^[^\s]+\s/, '') || 'General';
    const subLabel = workflow.subcategory?.label || 'Service Request';
    const catId    = workflow.category?.id || 'general';

    setIsTyping(true);

    const result = await createServiceNowTicket({
      studentId:   user.studentId,
      studentName: user.name,
      category:    catId,
      subcategory: subLabel,
      description,
      sentiment:   sentiment || 'neutral',
    });

    const ticketId = result.ticketId;
    const snLink   = result.link || null;

    setIsTyping(false);
    const ticket = getTicketConfirmation(ticketId, catLabel, subLabel, snLink);
    addMessage({ sender: 'bot', text: '', ticketData: ticket });

    if (result.success && ticketId) {
      console.log('[ChatInterface] Ticket created:', ticketId, '— starting poller');
      startPollingForResponse(ticketId);

      setTimeout(() => {
        sendBotMessage(
          `🔔 I'll notify you here as soon as an admin responds to your request **${ticketId}**.\n\nYou can submit another request or just wait — the response will appear in this chat automatically!`,
          CATEGORIES
        );
        setWorkflow({ step: 'categories', category: null, subcategory: null });
      }, 1800);
    } else {
      setTimeout(() => {
        sendBotMessage('⚠️ Note: Could not reach ServiceNow. Your request was saved locally.');
      }, 800);
    }
  }, [workflow, user, addMessage, sendBotMessage, startPollingForResponse]);

  // ── Handle category / subcategory clicks ──────────────────────
  const handleOptionClick = (opt) => {
    addMessage({ sender: 'user', text: opt.label });
    if (workflow.step === 'greeting' || workflow.step === 'categories') {
      const cat = CATEGORIES.find(c => c.id === opt.id);
      if (cat) {
        setWorkflow({ step: 'subcategories', category: cat, subcategory: null });
        sendBotMessage(getSubcategoryPrompt(cat.id), cat.subcategories);
      }
    } else if (workflow.step === 'subcategories') {
      setWorkflow(prev => ({ ...prev, step: 'documents', subcategory: opt }));
      sendBotMessage(getDocumentPrompt(opt.id));
    }
  };

  // ── Handle text messages ──────────────────────────────────────
  const handleSendText = (text) => {
    const sentiment = analyzeSentiment(text);
    addMessage({ sender: 'user', text, sentiment: sentiment.label ? sentiment : null });

    if (workflow.step === 'documents' || workflow.step === 'submitted') {
      const sentimentResp = getSentimentResponse(sentiment.sentiment);
      setWorkflow(prev => ({ ...prev, step: 'submitted' }));
      if (sentimentResp) {
        sendBotMessage(sentimentResp);
        setTimeout(() => submitToServiceNow(text, sentiment.sentiment), 2200);
      } else {
        submitToServiceNow(text, sentiment.sentiment);
      }
    } else {
      const sentimentResp = getSentimentResponse(sentiment.sentiment);
      if (sentimentResp) {
        sendBotMessage(sentimentResp + '\n\nPlease select a service category to get started:', CATEGORIES);
      } else {
        sendBotMessage("I'd be happy to help! Please select a service category below:", CATEGORIES);
      }
      setWorkflow({ step: 'categories', category: null, subcategory: null });
    }
  };

  const handleSendMedia = (media) => {
    addMessage({ sender: 'user', text: '', media });
    if (workflow.step === 'documents') {
      sendBotMessage('📎 Document received! Type any message to finalize your request.');
    } else {
      sendBotMessage('📎 Received! Please select a category first:', CATEGORIES);
      setWorkflow({ step: 'categories', category: null, subcategory: null });
    }
  };

  const handleSendAudio = (audioUrl) => {
    addMessage({ sender: 'user', audio: audioUrl });
    sendBotMessage(
      '🎤 Voice message received! ' +
      (workflow.step === 'documents' ? 'Type any message to finalize.' : 'Please select a category:'),
      workflow.step !== 'documents' ? CATEGORIES : null
    );
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <div className="chat-avatar"><Bot size={24} /></div>
        <div className="chat-header-info">
          <div className="chat-header-name">UniAssist Bot</div>
          <div className="chat-header-status">
            <span className="dot" />
            {isTyping ? 'typing...' : 'online'}
          </div>
        </div>
        <div className="chat-header-actions">
          <button title="Voice call"><Phone size={20} /></button>
          <button title="Video call"><Video size={20} /></button>
          <button title="Logout" onClick={onLogout} id="logout-btn"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="chat-messages" id="messages-area">
        {messages.map((msg, idx) => (
          <Message key={idx} msg={msg} onCategoryClick={handleOptionClick} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="bubble">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
        onSendAudio={handleSendAudio}
        onOpenCamera={() => setShowCamera(true)}
      />

      {showCamera && (
        <CameraModal onCapture={handleSendMedia} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
}