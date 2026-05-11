// ============================================================
// Admin Response Poller
// Polls u_admin_responses every 10 seconds
// Also fetches attachments from ServiceNow when response arrives
// ============================================================

const SN_USER = 'admin'
const SN_PASS = 'jFyC7qg8G+D/'
const RESPONSE_TABLE = 'u_admin_responses'
const TICKET_TABLE = 'u_university_request'

const snHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Basic ' + btoa(`${SN_USER}:${SN_PASS}`),
})

// Fetch admin responses for a ticket number
export async function fetchAdminResponses(ticketNumber) {
  try {
    const fields = 'sys_id,number,u_ticket_number,u_admin_name,u_response_text,u_action,u_student_id,sys_created_on'
    const url = `/sn-api/api/now/table/${RESPONSE_TABLE}`
      + `?sysparm_query=u_ticket_number=${ticketNumber}`
      + `&sysparm_fields=${fields}`
      + `&sysparm_orderby=sys_created_on`

    const res = await fetch(url, { headers: snHeaders() })
    if (!res.ok) return []
    const data = await res.json()
    return data.result || []
  } catch {
    return []
  }
}

// Fetch attachments linked to a ticket sys_id from u_university_request
export async function fetchTicketAttachments(ticketSysId) {
  try {
    const url = `/sn-api/api/now/attachment`
      + `?sysparm_query=table_name=${TICKET_TABLE}^table_sys_id=${ticketSysId}`
      + `&sysparm_fields=sys_id,file_name,size_bytes,content_type,download_link`
      + `&sysparm_limit=10`

    const res = await fetch(url, { headers: snHeaders() })
    if (!res.ok) return []
    const data = await res.json()
    return data.result || []
  } catch {
    return []
  }
}

// Fetch the ticket sys_id from ticket number
export async function fetchTicketSysId(ticketNumber) {
  try {
    const url = `/sn-api/api/now/table/${TICKET_TABLE}`
      + `?sysparm_query=number=${ticketNumber}`
      + `&sysparm_fields=sys_id`
      + `&sysparm_limit=1`

    const res = await fetch(url, { headers: snHeaders() })
    if (!res.ok) return null
    const data = await res.json()
    return data.result?.[0]?.sys_id || null
  } catch {
    return null
  }
}

// Build a usable download URL through proxy
export function buildDownloadUrl(sysId) {
  return `/sn-api/api/now/attachment/${sysId}/file`
}

// Action label mapping
export const ACTION_LABELS = {
  approve:  '✅ Approved',
  reject:   '❌ Rejected',
  hold:     '⏸ On Hold — More Info Needed',
  progress: '🔄 In Progress',
}

export const ACTION_COLORS = {
  approve:  '#10b981',
  reject:   '#ef4444',
  hold:     '#8b5cf6',
  progress: '#06b6d4',
}

// ─── Poller class ─────────────────────────────────────────────
export class ResponsePoller {
  constructor(ticketNumber, onNewResponse, intervalMs = 10000) {
    this.ticketNumber  = ticketNumber
    this.onNewResponse = onNewResponse
    this.intervalMs    = intervalMs
    this.timer         = null
    this.seenKeys      = new Set()
  }

  async poll() {
    console.log('[Poller] Polling for ticket:', this.ticketNumber)
    const responses = await fetchAdminResponses(this.ticketNumber)
    console.log('[Poller] Got responses:', responses.length)

    for (const r of responses) {
      const key = r.sys_created_on
      if (key && !this.seenKeys.has(key)) {
        this.seenKeys.add(key)
        console.log('[Poller] New response found:', r.u_admin_name)

        // Fetch attachments linked to this ticket
        const ticketSysId = await fetchTicketSysId(this.ticketNumber)
        let attachments = []
        if (ticketSysId) {
          attachments = await fetchTicketAttachments(ticketSysId)
          console.log('[Poller] Attachments found:', attachments.length)
        }

        // Pass response + attachments to callback
        this.onNewResponse({ ...r, attachments })
      }
    }
  }

  start() {
    console.log('[Poller] Started for ticket:', this.ticketNumber)
    this.poll()
    this.timer = setInterval(() => this.poll(), this.intervalMs)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      console.log('[Poller] Stopped for ticket:', this.ticketNumber)
    }
  }
}