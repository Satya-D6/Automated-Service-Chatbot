const SN_CONFIG = {
  instance:        'https://dev328681.service-now.com',
  username:        'admin',
  password:        'jFyC7qg8G+D/',
  assignmentGroup: '',
}

async function snFetch(endpoint, options = {}) {
  const url = `/sn-api/api/now/${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    Accept:         'application/json',
    Authorization:  'Basic ' + btoa(`${SN_CONFIG.username}:${SN_CONFIG.password}`),
    ...options.headers,
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ServiceNow API error ${response.status}: ${errText}`)
  }
  return response.json()
}

export async function createServiceNowTicket({
  studentId,
  studentName,
  category,
  subcategory,
  description,
  sentiment = 'neutral',
}) {
  const payload = {
    short_description: `[UniAssist] ${subcategory} — ${studentName} (${studentId})`,
    description: `
Student ID   : ${studentId}
Student Name : ${studentName}
Category     : ${category}
Service      : ${subcategory}
Sentiment    : ${sentiment}
Description  : ${description || 'Submitted via UniAssist chat portal'}
    `.trim(),
    priority:        sentiment === 'urgent' ? '1' : sentiment === 'negative' ? '2' : '3',
    state:           '1',
    u_student_id:    studentId,
    u_student_name:  studentName,
    u_service_category: category,
    u_service_type:  subcategory,
    u_sentiment:     sentiment,
  }

  try {
    const data = await snFetch('table/u_university_request', {
      method: 'POST',
      body:   JSON.stringify(payload),
    })
    const record = data.result
    return {
      success:  true,
      ticketId: record.number,
      sysId:    record.sys_id,
      link:     `${SN_CONFIG.instance}/nav_to.do?uri=u_university_request.do?sys_id=${record.sys_id}`,
    }
  } catch (error) {
    console.error('ServiceNow ticket creation failed:', error)
    return {
      success:  false,
      error:    error.message,
      ticketId: `LOCAL-${Math.floor(100000 + Math.random() * 900000)}`,
    }
  }
}

export async function getTicketStatus(ticketNumber) {
  try {
    const data = await snFetch(
      `table/u_university_request?sysparm_query=number=${ticketNumber}&sysparm_fields=number,state,short_description,u_student_name,u_service_type,sys_updated_on`
    )
    if (!data.result?.length) return { success: false, error: 'Ticket not found' }
    const t = data.result[0]
    const STATE_LABELS = { '1': 'New', '2': 'In Progress', '3': 'On Hold', '6': 'Resolved', '7': 'Closed' }
    return {
      success:   true,
      number:    t.number,
      state:     STATE_LABELS[t.state] || t.state,
      updatedAt: t.sys_updated_on,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function testConnection() {
  try {
    await snFetch('table/u_university_request?sysparm_limit=1&sysparm_fields=sys_id')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ── NEW: Poll u_admin_responses for a given ticket number ────────
// Called by ChatInterface every 10 seconds after ticket is created
export async function pollAdminResponse(ticketNumber) {
  try {
    const data = await snFetch(
      `table/u_admin_responses?sysparm_query=u_ticket_number=${ticketNumber}&sysparm_fields=u_ticket_number,u_student_id,u_admin_name,u_response_text,u_action,sys_created_on&sysparm_limit=1&sysparm_orderby=sys_created_on^DESC`
    )
    if (!data.result?.length) return null
    return data.result[0]
  } catch (error) {
    return null
  }
}