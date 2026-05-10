// ============================================================
// ServiceNow API — Admin Portal
// All calls go through Vite proxy /sn-api → dev328681.service-now.com
// ============================================================

const SN = {
  user:  'admin',
  pass:  'jFyC7qg8G+D/',
  table: 'u_university_request',
}

const headers = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Basic ' + btoa(`${SN.user}:${SN.pass}`),
})

// Fetch all tickets from custom table
export async function fetchAllTickets() {
  const fields = 'sys_id,number,short_description,description,state,priority,u_student_name,u_student_id,u_service_category,u_service_type,u_sentiment,sys_created_on,sys_updated_on,work_notes,comments'
  const res = await fetch(
    `/sn-api/api/now/table/${SN.table}?sysparm_fields=${fields}&sysparm_limit=50&sysparm_orderby=sys_created_on^DESC`,
    { headers: headers() }
  )
  const data = await res.json()
  return data.result || []
}

// Fetch a single ticket by sys_id
export async function fetchTicket(sysId) {
  const res = await fetch(
    `/sn-api/api/now/table/${SN.table}/${sysId}`,
    { headers: headers() }
  )
  const data = await res.json()
  return data.result
}

export const STATE_LABELS = {
  '1': 'New',
  '2': 'In Progress',
  '3': 'On Hold',
  '6': 'Resolved',
  '7': 'Closed',
}

export const STATE_COLORS = {
  '1': '#f59e0b',
  '2': '#06b6d4',
  '3': '#8b5cf6',
  '6': '#10b981',
  '7': '#64748b',
}

export const PRIORITY_LABELS = {
  '1': 'Critical',
  '2': 'High',
  '3': 'Medium',
  '4': 'Low',
}

export const PRIORITY_COLORS = {
  '1': '#ef4444',
  '2': '#f97316',
  '3': '#eab308',
  '4': '#22c55e',
}

// ── UPDATED sendResponse ─────────────────────────────────────────
// Now saves to u_admin_responses table so the student can see it
export async function sendResponse(ticket, { responseText, newState, adminName }) {
  const sysId = ticket.sys_id
  const ticketNumber = ticket.number
  const studentId = ticket.u_student_id || ''

  const stateMap = {
    approve:  '6',
    reject:   '7',
    hold:     '3',
    progress: '2',
  }

  // Step 1 — Update the main ticket in u_university_request
  const res = await fetch(
    `/sn-api/api/now/table/u_university_request/${sysId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        state: stateMap[newState] || '2',
        comments: `Admin Response from ${adminName}:\n\n${responseText}`,
        work_notes: `Admin ${adminName} responded: ${newState.toUpperCase()}`,
      }),
    }
  )
  if (!res.ok) throw new Error(`ServiceNow error: ${res.status}`)

  // Step 2 — Save to u_admin_responses table
  await fetch(
    `/sn-api/api/now/table/u_admin_responses`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        short_description: `Admin response for ${ticketNumber}`,
        u_ticket_number:   ticketNumber,
        u_student_id:      studentId,
        u_admin_name:      adminName,
        u_response_text:   responseText,
        u_action:          newState,
      }),
    }
  )

  return res.json()
}

// Get ticket activity log (comments/work notes)
export async function fetchActivity(sysId) {
  const res = await fetch(
    `/sn-api/api/now/table/sys_journal_field?sysparm_query=element_id=${sysId}^element=comments^ORvalue_type=journal&sysparm_fields=value,sys_created_on,sys_created_by&sysparm_orderby=sys_created_on^DESC&sysparm_limit=20`,
    { headers: headers() }
  )
  const data = await res.json()
  return data.result || []
}
