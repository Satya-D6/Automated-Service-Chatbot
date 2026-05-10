// ===== Bot Logic & Sentiment Analysis Utility =====

export const CATEGORIES = [
  {
    id: 'certificates',
    label: '📜 Certificates',
    icon: '📜',
    subcategories: [
      { id: 'bonafide', label: 'Bonafide Certificate' },
      { id: 'transfer', label: 'Transfer Certificate' },
      { id: 'study', label: 'Study Certificate' },
      { id: 'conduct', label: 'Conduct Certificate' },
      { id: 'provisional', label: 'Provisional Certificate' },
    ],
  },
  {
    id: 'attendance',
    label: '📋 Attendance',
    icon: '📋',
    subcategories: [
      { id: 'shortage', label: 'Attendance Shortage Appeal' },
      { id: 'report', label: 'Attendance Report Request' },
      { id: 'medical', label: 'Medical Leave Attendance Update' },
    ],
  },
  {
    id: 'examinations',
    label: '📝 Examinations',
    icon: '📝',
    subcategories: [
      { id: 'revaluation', label: 'Revaluation Request' },
      { id: 'hallticket', label: 'Hall Ticket Issue' },
      { id: 'supple', label: 'Supplementary Exam Registration' },
      { id: 'marks', label: 'Marks Memo Request' },
    ],
  },
  {
    id: 'fees',
    label: '💰 Fee & Payments',
    icon: '💰',
    subcategories: [
      { id: 'receipt', label: 'Fee Receipt Request' },
      { id: 'refund', label: 'Fee Refund Application' },
      { id: 'scholarship', label: 'Scholarship Inquiry' },
      { id: 'due', label: 'Fee Due Clarification' },
    ],
  },
  {
    id: 'general',
    label: '🏫 General Services',
    icon: '🏫',
    subcategories: [
      { id: 'idcard', label: 'ID Card Issue/Replacement' },
      { id: 'hostel', label: 'Hostel Allotment' },
      { id: 'library', label: 'Library Issue' },
      { id: 'transport', label: 'Transport Service Request' },
      { id: 'other', label: 'Other / Custom Request' },
    ],
  },
  {
    id: 'scholarship',
    label: '🏆 Scholarship',
    subcategories: [
      { id: 'newscholarship', label: 'New Scholarship Application' },
      { id: 'renewal', label: 'Scholarship Renewal' },
      { id: 'status', label: 'Scholarship Status Inquiry' },
    ],
  },
  {
    id: 'hostel',
    label: '🏠 Hostel',
    subcategories: [
      { id: 'allotment', label: 'Hostel Allotment Request' },
      { id: 'roomchange', label: 'Room Change Request' },
      { id: 'hostelleave', label: 'Hostel Leave Application' },
      { id: 'complaint', label: 'Hostel Complaint' },
    ],
  },
  {
    id: 'transport',
    label: '🚌 Transport',
    subcategories: [
      { id: 'buspass', label: 'Bus Pass Request' },
      { id: 'routechange', label: 'Route Change Request' },
      { id: 'transportissue', label: 'Transport Issue Report' },
    ],
  },
  {
    id: 'library',
    label: '📚 Library',
    subcategories: [
      { id: 'librarycard', label: 'Library Card Issue' },
      { id: 'bookrenew', label: 'Book Renewal Request' },
      { id: 'libraryfine', label: 'Library Fine Inquiry' },
    ],
  },
  {
    id: 'studentid',
    label: '🪪 Student ID',
    subcategories: [
      { id: 'idnew', label: 'New ID Card Request' },
      { id: 'idlost', label: 'Lost ID Card Replacement' },
      { id: 'iddamaged', label: 'Damaged ID Card Replacement' },
    ],
  },
  {
    id: 'placement',
    label: '💼 Placement',
    subcategories: [
      { id: 'placementregister', label: 'Placement Registration' },
      { id: 'noc', label: 'NOC for Job/Internship' },
      { id: 'placementletter', label: 'Placement Letter Request' },
    ],
  },
  {
    id: 'leave',
    label: '🗓️ Leave',
    subcategories: [
      { id: 'medicalleave', label: 'Medical Leave Application' },
      { id: 'casualleave', label: 'Casual Leave Application' },
      { id: 'dutyleave', label: 'Duty Leave Application' },
    ],
  },
  {
    id: 'fees',
    label: '💰 Fee',
    subcategories: [
      { id: 'receipt', label: 'Fee Receipt Request' },
      { id: 'refund', label: 'Fee Refund Application' },
      { id: 'due', label: 'Fee Due Clarification' },
      { id: 'installment', label: 'Fee Installment Request' },
    ],
  },
  {
    id: 'complaint',
    label: '📣 Complaint',
    subcategories: [
      { id: 'academic_complaint', label: 'Academic Complaint' },
      { id: 'staff_complaint', label: 'Staff Complaint' },
      { id: 'facility_complaint', label: 'Facility Complaint' },
      { id: 'ragging', label: 'Anti-Ragging Complaint' },
    ],
  },
  {
    id: 'health',
    label: '🏥 Health',
    subcategories: [
      { id: 'medicalcert', label: 'Medical Certificate Request' },
      { id: 'healthcard', label: 'Health Card Issue' },
      { id: 'firstaid', label: 'First Aid Request' },
    ],
  },
  {
    id: 'it',
    label: '💻 IT Support',
    subcategories: [
      { id: 'emailissue', label: 'Email/Portal Access Issue' },
      { id: 'wifiissue', label: 'WiFi Access Issue' },
      { id: 'softwarereq', label: 'Software/Tool Request' },
    ],
  },
  {
    id: 'events',
    label: '🎉 Events',
    subcategories: [
      { id: 'eventpermission', label: 'Event Permission Request' },
      { id: 'eventregistration', label: 'Event Registration' },
      { id: 'auditorium', label: 'Auditorium/Venue Booking' },
    ],
  },
  {
    id: 'faculty',
    label: '👨‍🏫 Faculty Interaction',
    subcategories: [
      { id: 'appointment', label: 'Faculty Appointment Request' },
      { id: 'feedback', label: 'Faculty Feedback' },
      { id: 'mentoring', label: 'Mentoring Session Request' },
    ],
  },
  {
    id: 'admin',
    label: '🏫 Admin Services',
    subcategories: [
      { id: 'noobjection', label: 'No Objection Certificate' },
      { id: 'bonafide_admin', label: 'General Admin Request' },
      { id: 'other', label: 'Other / Custom Request' },
    ],
  },
  {
    id: 'alumni',
    label: '🎓 Alumni',
    subcategories: [
      { id: 'alumnicard', label: 'Alumni Card Request' },
      { id: 'alumnicert', label: 'Alumni Certificate' },
      { id: 'alumnireg', label: 'Alumni Registration' },
    ],
  },
];

// ===== Sentiment Analysis (keyword-based mock NLP) =====
const SENTIMENT_RULES = [
  { keywords: ['urgent', 'asap', 'immediately', 'emergency', 'critical'], sentiment: 'urgent', label: '⚡ Urgent' },
  { keywords: ['frustrated', 'angry', 'terrible', 'worst', 'disgusting', 'horrible', 'hate', 'annoyed', 'useless'], sentiment: 'negative', label: '😟 Concerned' },
  { keywords: ['thank', 'thanks', 'great', 'awesome', 'excellent', 'wonderful', 'love', 'happy', 'perfect', 'appreciate'], sentiment: 'positive', label: '😊 Positive' },
];

export function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  for (const rule of SENTIMENT_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return { sentiment: rule.sentiment, label: rule.label };
    }
  }
  return { sentiment: 'neutral', label: null };
}

// ===== Bot Response Generator =====
export function getBotGreeting(name) {
  return `Hello ${name}! 👋\n\nWelcome to **UniAssist** — your AI-powered university service portal.\n\nI'm here to help you with any administrative service you need. Let's get started!\n\nPlease select a **service category** below:`;
}

export function getSubcategoryPrompt(category) {
  const cat = CATEGORIES.find(c => c.id === category);
  if (!cat) return 'Please select a valid category.';
  return `Great choice! ${cat.icon}\n\nHere are the available services under **${cat.label.replace(cat.icon + ' ', '')}**.\n\nPlease select your specific request:`;
}

export function getDocumentPrompt(subcategory) {
  const commonDetails = `📋 Please provide the below details:\n\n• Name\n• Roll No\n• Year of Passing\n• Technology\n• Service Request\n• Purpose\n• Signature\n• ID Card (.pdf)\n• Description`;

  const docMap = {
    bonafide: `${commonDetails}\n\n📎 Additional documents required:\n• Purpose letter (if any)\n• Recent photograph`,
    transfer: `${commonDetails}\n\n📎 Additional documents required:\n• No-dues certificate\n• Fee payment receipts`,
    revaluation: `${commonDetails}\n\n📎 Additional documents required:\n• Hall ticket copy\n• Exam fee receipt\n• Subject details`,
    scholarship: `${commonDetails}\n\n📎 Additional documents required:\n• Income certificate\n• Previous year marks\n• Bank passbook copy`,
    hallticket: `${commonDetails}\n\n📎 Additional documents required:\n• Fee payment receipt\n• Enrollment number`,
    transcript: `${commonDetails}\n\n📎 Additional documents required:\n• Previous mark sheets\n• Fee receipt`,
    migration: `${commonDetails}\n\n📎 Additional documents required:\n• Transfer certificate\n• Last semester marksheet`,
    idlost: `${commonDetails}\n\n📎 Additional documents required:\n• Police complaint copy\n• Passport size photo`,
    iddamaged: `${commonDetails}\n\n📎 Additional documents required:\n• Damaged ID card\n• Passport size photo`,
    medicalleave: `${commonDetails}\n\n📎 Additional documents required:\n• Medical certificate from doctor\n• Hospital bills (if any)`,
    refund: `${commonDetails}\n\n📎 Additional documents required:\n• Original fee receipt\n• Bank account details`,
    ragging: `${commonDetails}\n\n📎 Additional documents required:\n• Written complaint\n• Witness details (if any)`,
    noc: `${commonDetails}\n\n📎 Additional documents required:\n• Offer letter from company\n• Internship details`,
    default: '📎 Please provide any relevant documents or details to support your request.\n\nYou can use the 📎 attachment button, 📷 camera, or simply type your details.',
  };

  return docMap[subcategory] || commonDetails;
}

export function getSentimentResponse(sentiment) {
  const responses = {
    urgent: "⚡ I can see this is urgent. I'll prioritize this request and flag it for immediate attention by our administrative team.",
    negative: "😔 I'm sorry you're experiencing difficulties. Let me help resolve this as quickly as possible. Your concern has been noted.",
    positive: "😊 Thank you for your kind words! I'm happy to assist you. Let's proceed with your request.",
    neutral: '',
  };
  return responses[sentiment] || '';
}

export function generateTicketId() {
  const prefix = 'LOCAL';
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

export function getTicketConfirmation(ticketId, category, subcategory, snLink = null) {
  return {
    type: 'ticket',
    ticketId,
    category,
    subcategory,
    snLink,   // direct link to the ServiceNow record (if available)
    message: `Your request has been successfully submitted! 🎉`,
    details: `Ticket ID: ${ticketId}\nStatus: Assigned to Admin\nEstimated Response: 24-48 hours\n\nYou'll receive updates here as your request is processed.`,
  };
}

export function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
