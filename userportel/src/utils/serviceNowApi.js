// ===== ServiceNow PDI Integration Layer =====
// Replace the placeholder values below with your actual PDI instance details

const SN_CONFIG = {
  // Your ServiceNow PDI instance URL (e.g., https://dev12345.service-now.com)
  instance: import.meta.env.VITE_SN_INSTANCE || 'https://YOUR_PDI_INSTANCE.service-now.com',

  // Basic Auth credentials (use a dedicated integration user in production)
  username: import.meta.env.VITE_SN_USER || 'admin',
  password: import.meta.env.VITE_SN_PASS || 'YOUR_PASSWORD',

  // ServiceNow table names
  tables: {
    incident: 'incident',
    requestItem: 'sc_req_item',
    request: 'sc_request',
    task: 'sc_task',
    // Custom table — create this in your PDI (see setup guide)
    universityRequest: 'u_university_request',
  },

  // Assignment group sys_id — update after creating the group in your PDI
  assignmentGroup: import.meta.env.VITE_SN_GROUP || '',
};

// ─────────────────────────────────────────────
// Core fetch wrapper with Basic Auth
// ─────────────────────────────────────────────
async function snFetch(endpoint, options = {}) {
  const url = `${SN_CONFIG.instance}/api/now/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + btoa(`${SN_CONFIG.username}:${SN_CONFIG.password}`),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ServiceNow API error ${response.status}: ${errText}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Map app categories → ServiceNow category values
// ─────────────────────────────────────────────
const CATEGORY_MAP = {
  certificates: 'certificate_request',
  attendance: 'attendance_issue',
  examinations: 'examination_request',
  fees: 'fee_payment',
  general: 'general_inquiry',
};

const PRIORITY_MAP = {
  urgent: '1',   // Critical
  negative: '2', // High
  neutral: '3',  // Moderate
  positive: '4', // Low
};

// ─────────────────────────────────────────────
// Create a University Request record in ServiceNow
// ─────────────────────────────────────────────
export async function createServiceNowTicket({
  studentId,
  studentName,
  category,
  subcategory,
  description,
  sentiment = 'neutral',
  attachments = [],
}) {
  // Build the incident/request payload
  const payload = {
    // Standard Incident fields (works on any PDI without custom table)
    short_description: `[UniAssist] ${subcategory} — ${studentName} (${studentId})`,
    description: `
Student ID   : ${studentId}
Student Name : ${studentName}
Category     : ${category}
Service      : ${subcategory}
Sentiment    : ${sentiment}
Description  : ${description || 'Submitted via UniAssist chat portal'}
    `.trim(),
    category: CATEGORY_MAP[category?.toLowerCase()] || 'general_inquiry',
    subcategory: subcategory,
    priority: PRIORITY_MAP[sentiment] || '3',
    urgency: sentiment === 'urgent' ? '1' : '3',
    impact: '3',
    caller_id: studentId,       // Will resolve to a user sys_id if the user exists in SN
    contact_type: 'self-service',
    state: '1',                  // New
    // Custom fields — prefix with u_ as per ServiceNow convention
    u_student_id: studentId,
    u_student_name: studentName,
    u_service_category: category,
    u_service_type: subcategory,
    u_sentiment: sentiment,
    ...(SN_CONFIG.assignmentGroup
      ? { assignment_group: SN_CONFIG.assignmentGroup }
      : {}),
  };

  try {
    const data = await snFetch(`table/${SN_CONFIG.tables.incident}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const record = data.result;

    return {
      success: true,
      ticketId: record.number,          // e.g. INC0010034
      sysId: record.sys_id,
      state: record.state,
      link: `${SN_CONFIG.instance}/nav_to.do?uri=incident.do?sys_id=${record.sys_id}`,
    };
  } catch (error) {
    console.error('ServiceNow ticket creation failed:', error);
    return {
      success: false,
      error: error.message,
      // Fallback to local ticket ID so the UI doesn't break
      ticketId: `LOCAL-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}

// ─────────────────────────────────────────────
// Get ticket status by sys_id or number
// ─────────────────────────────────────────────
export async function getTicketStatus(ticketNumber) {
  try {
    const data = await snFetch(
      `table/${SN_CONFIG.tables.incident}?sysparm_query=number=${ticketNumber}&sysparm_fields=number,state,short_description,assigned_to,priority,sys_updated_on`
    );

    if (!data.result?.length) {
      return { success: false, error: 'Ticket not found' };
    }

    const t = data.result[0];
    const STATE_LABELS = {
      '1': 'New',
      '2': 'In Progress',
      '3': 'On Hold',
      '6': 'Resolved',
      '7': 'Closed',
    };

    return {
      success: true,
      number: t.number,
      state: STATE_LABELS[t.state] || t.state,
      assignedTo: t.assigned_to?.display_value || 'Unassigned',
      updatedAt: t.sys_updated_on,
      priority: t.priority,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// Add a work note / attachment comment to a ticket
// ─────────────────────────────────────────────
export async function addCommentToTicket(sysId, comment) {
  try {
    await snFetch(`table/${SN_CONFIG.tables.incident}/${sysId}`, {
      method: 'PATCH',
      body: JSON.stringify({ work_notes: comment }),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// Test connectivity to your PDI
// ─────────────────────────────────────────────
export async function testConnection() {
  try {
    const data = await snFetch('table/sys_properties?sysparm_limit=1&sysparm_fields=name');
    return { success: true, instance: SN_CONFIG.instance };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
