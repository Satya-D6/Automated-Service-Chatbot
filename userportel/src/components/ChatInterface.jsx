import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Phone, Video, MoreVertical, LogOut } from 'lucide-react';
import Message from './Message';
import ChatInput from './ChatInput';
import CameraModal from './CameraModal';
import {
  CATEGORIES,
  analyzeSentiment,
  getBotGreeting,
  getSubcategoryPrompt,
  getDocumentPrompt,
  getSentimentResponse,
  generateTicketId,
  getTicketConfirmation,
  getTimeString,
} from '../utils/botLogic';
import { createServiceNowTicket } from '../utils/serviceNowApi';

export default function ChatInterface({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [workflow, setWorkflow] = useState({ step: 'greeting', category: null, subcategory: null });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Send greeting on mount
  useEffect(() => {
    sendBotMessage(getBotGreeting(user.name), CATEGORIES);
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

  // ─── ServiceNow ticket creation ───────────────────────
  const submitToServiceNow = useCallback(async (description, sentiment) => {
    const catLabel = workflow.category?.label?.replace(/^[^\s]+\s/, '') || 'General';
    const subLabel = workflow.subcategory?.label || 'Service Request';
    const catId    = workflow.category?.id || 'general';
    const subId    = workflow.subcategory?.id || 'other';

    setIsTyping(true);

    // Call ServiceNow API
    const result = await createServiceNowTicket({
      studentId: user.studentId,
      studentName: user.name,
      category: catId,
      subcategory: subLabel,
      description,
      sentiment: sentiment || 'neutral',
    });

    const ticketId = result.ticketId;
    const snLink   = result.link || null;

    setIsTyping(false);
    const ticket = getTicketConfirmation(ticketId, catLabel, subLabel, snLink);
    addMessage({ sender: 'bot', text: '', ticketData: ticket });

    // Was the submission via real SN or fallback?
    if (!result.success) {
      setTimeout(() => {
        sendBotMessage(
          '⚠️ Note: Could not reach ServiceNow right now. Your request has been saved locally with the ID above and will be synced once connectivity is restored.'
        );
      }, 800);
    }

    setTimeout(() => {
      sendBotMessage(
        'Is there anything else I can help you with? 😊\n\nSelect a category below to submit another request:',
        CATEGORIES
      );
      setWorkflow({ step: 'categories', category: null, subcategory: null });
    }, 1800);
  }, [workflow, user, addMessage, sendBotMessage]);

  // Handle category / subcategory clicks
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

  // Handle text messages from user
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
        sendBotMessage(
          "I'd be happy to help! Please select a service category below to proceed with your request:",
          CATEGORIES
        );
      }
      setWorkflow({ step: 'categories', category: null, subcategory: null });
    }
  };

  // Handle media messages
  const handleSendMedia = (media) => {
    addMessage({ sender: 'user', text: '', media });

    if (workflow.step === 'documents') {
      sendBotMessage(
        '📎 Document received! Thank you.\n\nWould you like to add more documents, or type any additional details?\n\nWhen ready, just type *"submit"* or send any message to finalize your request.'
      );
    } else {
      sendBotMessage(
        '📎 I\'ve received your attachment. If this is for a service request, please select a category first:',
        CATEGORIES
      );
      setWorkflow({ step: 'categories', category: null, subcategory: null });
    }
  };

  // Handle audio messages
  const handleSendAudio = (audioUrl) => {
    addMessage({ sender: 'user', audio: audioUrl });

    sendBotMessage(
      '🎤 Voice message received! I\'ve noted your input.\n\n' +
      (workflow.step === 'documents'
        ? 'Your voice note has been attached to your request. Type any message or send *"submit"* to finalize.'
        : 'For best results, please select a service category:')
    , workflow.step !== 'documents' ? CATEGORIES : null);
  };

  return (
    <div className="chat-app">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">
          <Bot size={24} />
        </div>
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

      {/* Messages Area */}
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

      {/* Input Bar */}
      <ChatInput
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
        onSendAudio={handleSendAudio}
        onOpenCamera={() => setShowCamera(true)}
      />

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onCapture={handleSendMedia}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
