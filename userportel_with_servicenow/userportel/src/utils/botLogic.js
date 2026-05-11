// ===== Bot Logic & Sentiment Analysis Utility =====

export const CATEGORIES = [
  {
    id: 'certificates',
    label: '📜 Certificate Services',
    icon: '📜',
    subcategories: [
      { id: 'bonafide',    label: 'Bonafide Certificate' },
      { id: 'transfer',    label: 'Transfer Certificate' },
      { id: 'study',       label: 'Study Certificate' },
      { id: 'conduct',     label: 'Conduct Certificate' },
      { id: 'provisional', label: 'Provisional Certificate' },
    ],
  },
  {
    id: 'examinations',
    label: '📝 Examination Services',
    icon: '📝',
    subcategories: [
      { id: 'revaluation', label: 'Revaluation Request' },
      { id: 'hallticket',  label: 'Hall Ticket Issue' },
      { id: 'supple',      label: 'Supplementary Exam Registration' },
      { id: 'marks',       label: 'Marks Memo Request' },
    ],
  },
  {
    id: 'academic',
    label: '🎓 Academic Records',
    icon: '🎓',
    subcategories: [
      { id: 'transcript',   label: 'Transcript Request' },
      { id: 'gradcard',     label: 'Grade Card Request' },
      { id: 'migration',    label: 'Migration Certificate' },
      { id: 'verification', label: 'Degree Verification' },
    ],
  },
  {
    id: 'attendance',
    label: '📋 Attendance Services',
    icon: '📋',
    subcategories: [
      { id: 'shortage', label: 'Attendance Shortage Appeal' },
      { id: 'report',   label: 'Attendance Report Request' },
      { id: 'medical',  label: 'Medical Leave Attendance Update' },
    ],
  },
  {
    id: 'scholarship',
    label: '🏆 Scholarship',
    icon: '🏆',
    subcategories: [
      { id: 'newscholarship', label: 'New Scholarship Application' },
      { id: 'renewal',        label: 'Scholarship Renewal' },
      { id: 'schstatus',      label: 'Scholarship Status Inquiry' },
    ],
  },
  {
    id: 'hostel',
    label: '🏠 Hostel',
    icon: '🏠',
    subcategories: [
      { id: 'allotment',    label: 'Hostel Allotment Request' },
      { id: 'roomchange',   label: 'Room Change Request' },
      { id: 'hostelleave',  label: 'Hostel Leave Application' },
      { id: 'hostelcomp',   label: 'Hostel Complaint' },
    ],
  },
  {
    id: 'transport',
    label: '🚌 Transport',
    icon: '🚌',
    subcategories: [
      { id: 'buspass',        label: 'Bus Pass Request' },
      { id: 'routechange',    label: 'Route Change Request' },
      { id: 'transportissue', label: 'Transport Issue Report' },
    ],
  },
  {
    id: 'library',
    label: '📚 Library',
    icon: '📚',
    subcategories: [
      { id: 'librarycard', label: 'Library Card Issue' },
      { id: 'bookrenew',   label: 'Book Renewal Request' },
      { id: 'libraryfine', label: 'Library Fine Inquiry' },
    ],
  },
  {
    id: 'studentid',
    label: '🪪 Student ID',
    icon: '🪪',
    subcategories: [
      { id: 'idnew',     label: 'New ID Card Request' },
      { id: 'idlost',    label: 'Lost ID Card Replacement' },
      { id: 'iddamaged', label: 'Damaged ID Card Replacement' },
    ],
  },
  {
    id: 'placement',
    label: '💼 Placement',
    icon: '💼',
    subcategories: [
      { id: 'placementregister', label: 'Placement Registration' },
      { id: 'noc',               label: 'NOC for Job/Internship' },
      { id: 'placementletter',   label: 'Placement Letter Request' },
    ],
  },
  {
    id: 'leave',
    label: '🗓️ Leave',
    icon: '🗓️',
    subcategories: [
      { id: 'medicalleave', label: 'Medical Leave Application' },
      { id: 'casualleave',  label: 'Casual Leave Application' },
      { id: 'dutyleave',    label: 'Duty Leave Application' },
    ],
  },
  {
    id: 'fees',
    label: '💰 Fee & Payments',
    icon: '💰',
    subcategories: [
      { id: 'receipt',     label: 'Fee Receipt Request' },
      { id: 'refund',      label: 'Fee Refund Application' },
      { id: 'due',         label: 'Fee Due Clarification' },
      { id: 'installment', label: 'Fee Installment Request' },
    ],
  },
  {
    id: 'complaint',
    label: '📣 Complaint',
    icon: '📣',
    subcategories: [
      { id: 'academic_complaint', label: 'Academic Complaint' },
      { id: 'staff_complaint',    label: 'Staff Complaint' },
      { id: 'facility_complaint', label: 'Facility Complaint' },
      { id: 'ragging',            label: 'Anti-Ragging Complaint' },
    ],
  },
  {
    id: 'health',
    label: '🏥 Health',
    icon: '🏥',
    subcategories: [
      { id: 'medicalcert', label: 'Medical Certificate Request' },
      { id: 'healthcard',  label: 'Health Card Issue' },
      { id: 'firstaid',    label: 'First Aid Request' },
    ],
  },
  {
    id: 'it',
    label: '💻 IT Support',
    icon: '💻',
    subcategories: [
      { id: 'emailissue',  label: 'Email/Portal Access Issue' },
      { id: 'wifiissue',   label: 'WiFi Access Issue' },
      { id: 'softwarereq', label: 'Software/Tool Request' },
    ],
  },
  {
    id: 'events',
    label: '🎉 Events',
    icon: '🎉',
    subcategories: [
      { id: 'eventpermission',   label: 'Event Permission Request' },
      { id: 'eventregistration', label: 'Event Registration' },
      { id: 'auditorium',        label: 'Auditorium/Venue Booking' },
    ],
  },
  {
    id: 'faculty',
    label: '👨‍🏫 Faculty Interaction',
    icon: '👨‍🏫',
    subcategories: [
      { id: 'appointment', label: 'Faculty Appointment Request' },
      { id: 'feedback',    label: 'Faculty Feedback' },
      { id: 'mentoring',   label: 'Mentoring Session Request' },
    ],
  },
  {
    id: 'admin',
    label: '🏫 Admin Services',
    icon: '🏫',
    subcategories: [
      { id: 'noobjection',    label: 'No Objection Certificate' },
      { id: 'bonafide_admin', label: 'General Admin Request' },
      { id: 'other',          label: 'Other / Custom Request' },
    ],
  },
  {
    id: 'alumni',
    label: '🎓 Alumni',
    icon: '🎓',
    subcategories: [
      { id: 'alumnicard', label: 'Alumni Card Request' },
      { id: 'alumnicert', label: 'Alumni Certificate' },
      { id: 'alumnireg',  label: 'Alumni Registration' },
    ],
  },
]

// ===== Sentiment Analysis =====
const SENTIMENT_RULES = [
  { keywords: ['urgent', 'asap', 'immediately', 'emergency', 'critical'], sentiment: 'urgent', label: '⚡ Urgent' },
  { keywords: ['frustrated', 'angry', 'terrible', 'worst', 'disgusting', 'horrible', 'hate', 'annoyed', 'useless'], sentiment: 'negative', label: '😟 Concerned' },
  { keywords: ['thank', 'thanks', 'great', 'awesome', 'excellent', 'wonderful', 'love', 'happy', 'perfect', 'appreciate'], sentiment: 'positive', label: '😊 Positive' },
]

export function analyzeSentiment(text) {
  const lower = text.toLowerCase()
  for (const rule of SENTIMENT_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return { sentiment: rule.sentiment, label: rule.label }
    }
  }
  return { sentiment: 'neutral', label: null }
}

export function getBotGreeting(name) {
  return `Hello ${name}! 👋\n\nWelcome to **UniAssist** — your AI-powered university service portal.\n\nI'm here to help you with any administrative service you need. Let's get started!\n\nPlease select a **service category** below:`
}

export function getSubcategoryPrompt(category) {
  const cat = CATEGORIES.find(c => c.id === category)
  if (!cat) return 'Please select a valid category.'
  const label = cat.label.replace(cat.icon + ' ', '')
  return `Great choice! ${cat.icon}\n\nHere are the available services under **${label}**.\n\nPlease select your specific request:`
}

export function getDocumentPrompt(subcategory) {
  const commonDetails = `📋 Please provide the below details:\n\n• Name\n• Roll No\n• Year of Passing\n• Technology\n• Service Request\n• Purpose\n• Signature\n• ID Card (.pdf)\n• Description`

  const docMap = {
    bonafide:       `${commonDetails}\n\n📎 Additional documents required:\n• Purpose letter (if any)\n• Recent photograph`,
    transfer:       `${commonDetails}\n\n📎 Additional documents required:\n• No-dues certificate\n• Fee payment receipts`,
    revaluation:    `${commonDetails}\n\n📎 Additional documents required:\n• Hall ticket copy\n• Exam fee receipt\n• Subject details`,
    newscholarship: `${commonDetails}\n\n📎 Additional documents required:\n• Income certificate\n• Previous year marks\n• Bank passbook copy`,
    hallticket:     `${commonDetails}\n\n📎 Additional documents required:\n• Fee payment receipt\n• Enrollment number`,
    transcript:     `${commonDetails}\n\n📎 Additional documents required:\n• Previous mark sheets\n• Fee receipt`,
    migration:      `${commonDetails}\n\n📎 Additional documents required:\n• Transfer certificate\n• Last semester marksheet`,
    idlost:         `${commonDetails}\n\n📎 Additional documents required:\n• Police complaint copy\n• Passport size photo`,
    iddamaged:      `${commonDetails}\n\n📎 Additional documents required:\n• Damaged ID card\n• Passport size photo`,
    medicalleave:   `${commonDetails}\n\n📎 Additional documents required:\n• Medical certificate from doctor\n• Hospital bills (if any)`,
    refund:         `${commonDetails}\n\n📎 Additional documents required:\n• Original fee receipt\n• Bank account details`,
    ragging:        `${commonDetails}\n\n📎 Additional documents required:\n• Written complaint\n• Witness details (if any)`,
    noc:            `${commonDetails}\n\n📎 Additional documents required:\n• Offer letter from company\n• Internship details`,
  }

  return docMap[subcategory] || commonDetails
}

export function getSentimentResponse(sentiment) {
  const responses = {
    urgent:   "⚡ I can see this is urgent. I'll prioritize this request and flag it for immediate attention by our administrative team.",
    negative: "😔 I'm sorry you're experiencing difficulties. Let me help resolve this as quickly as possible. Your concern has been noted.",
    positive: "😊 Thank you for your kind words! I'm happy to assist you. Let's proceed with your request.",
    neutral:  '',
  }
  return responses[sentiment] || ''
}

export function generateTicketId() {
  const prefix = 'LOCAL'
  const num = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${num}`
}

export function getTicketConfirmation(ticketId, category, subcategory, snLink = null) {
  return {
    type: 'ticket',
    ticketId,
    category,
    subcategory,
    snLink,
    message: 'Your request has been successfully submitted! 🎉',
    details: `Ticket ID: ${ticketId}\nStatus: Assigned to Admin\nEstimated Response: 24-48 hours\n\nYou'll receive updates here as your request is processed.`,
  }
}

export function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}