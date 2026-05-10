const SN_USER = 'admin'
const SN_PASS = 'jFyC7qg8G+D/'
const RESPONSE_TABLE = 'u_admin_responses'

const snHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Basic ' + btoa(`${SN_USER}:${SN_PASS}`),
})

export async function fetchAdminResponses(ticketNumber) {
  try {
    const url = `/sn-api/api/now/table/${RESPONSE_TABLE}`
      + `?sysparm_query=u_ticket_number=${ticketNumber}`
      + `&sysparm_fields=sys_created_on,u_ticket_number,u_admin_name,u_response_text,u_action`
      + `&sysparm_orderby=sys_created_on`
      + `&sysparm_limit=5`

    const res = await fetch(url, { headers: snHeaders() })
    if (!res.ok) return []
    const data = await res.json()
    return data.result || []
  } catch (e) {
    console.error('[Poller] fetch error:', e)
    return []
  }
}

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

export class ResponsePoller {
  constructor(ticketNumber, onNewResponse, intervalMs = 10000) {
    this.ticketNumber  = ticketNumber
    this.onNewResponse = onNewResponse
    this.intervalMs    = intervalMs
    this.timer         = null
    this.seenKeys      = new Set()  // use sys_created_on as unique key
  }

  async poll() {
    console.log('[Poller] Polling for ticket:', this.ticketNumber)
    const responses = await fetchAdminResponses(this.ticketNumber)
    console.log('[Poller] Got responses:', responses.length)

    for (const r of responses) {
      // Use sys_created_on as unique key since sys_id is not fetched
      const key = r.sys_created_on
      if (key && !this.seenKeys.has(key)) {
        this.seenKeys.add(key)
        console.log('[Poller] New response found:', r.u_admin_name)
        this.onNewResponse(r)
      }
    }
  }

  start() {
    console.log('[Poller] Started for ticket:', this.ticketNumber)
    // Poll immediately
    this.poll()
    // Then every 10 seconds
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