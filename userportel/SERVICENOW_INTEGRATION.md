# ServiceNow PDI Integration Guide
## UniAssist — Automated Administrative Service Chatbot

---

## Overview

This guide walks you through connecting your React User Portal to a **ServiceNow Personal Developer Instance (PDI)** so that every student request automatically creates a real ticket in ServiceNow and lands in your Admin portal dashboard.

```
Student Chat (React) ──► serviceNowApi.js ──► ServiceNow REST API ──► Incident Table ──► Admin Portal
```

---

## Step 1 — Claim Your Free PDI

1. Go to **https://developer.servicenow.com**
2. Sign in or create a free account
3. Click **Start Building** → **Request Instance**
4. Choose the latest release (e.g., Xanadu or Yokohama)
5. Your instance URL will look like: `https://dev12345.service-now.com`
6. **Save your admin username & password** — you'll need them

> ⚠️ PDIs hibernate after 10 days of inactivity. Log in periodically to keep it awake.

---

## Step 2 — Configure Your .env File

In the project root, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SN_INSTANCE=https://devXXXXX.service-now.com
VITE_SN_USER=admin
VITE_SN_PASS=your_password_here
VITE_SN_GROUP=
```

> **Security note**: Vite exposes `VITE_*` variables in the browser bundle. For production,  
> route your SN calls through a backend proxy (Node/Express) and keep credentials server-side.

---

## Step 3 — Fix the CORS Issue (Critical)

ServiceNow blocks browser-to-API calls by default. You must whitelist your dev origin.

### In your PDI:
1. Navigate to **System Properties → Security → Cross-Origin Resource Sharing**
   - URL: `https://devXXXXX.service-now.com/nav_to.do?uri=sys_properties_list.do?sysparm_query=name=glide.rest.cors.allow_all`
2. Search for property: `glide.rest.cors.allow_all`
3. Set value to: `true` *(dev only — restrict in production)*

### OR whitelist your specific origin:
1. Go to **System Web Services → REST → CORS Rules** (table: `sys_ws_cors_rule`)
2. Click **New**
3. Fill in:
   - Name: `UniAssist Dev`
   - REST API: *(leave blank for all)*
   - Domain: `http://localhost:5173`
4. Save

---

## Step 4 — Create an Assignment Group

1. In your PDI go to **User Administration → Groups**
2. Click **New**
3. Set:
   - Name: `University Admin`
   - Description: `Handles all student administrative requests`
4. Save and copy the **sys_id** from the URL bar
5. Paste it into your `.env` as `VITE_SN_GROUP`

---

## Step 5 — (Optional) Create a Custom Table

For cleaner reporting, create a dedicated table instead of using `incident`:

1. Go to **System Definition → Tables**
2. Click **New**
3. Fill in:
   - Label: `University Request`
   - Name: `u_university_request` *(auto-prefixed with u_)*
   - Extends table: `Task`
4. Add custom columns:

| Column Label    | Column Name        | Type   |
|-----------------|--------------------|--------|
| Student ID      | u_student_id       | String |
| Student Name    | u_student_name     | String |
| Service Category| u_service_category | String |
| Service Type    | u_service_type     | String |
| Sentiment       | u_sentiment        | String |

5. In `src/utils/serviceNowApi.js`, change:
   ```js
   // From:
   `table/${SN_CONFIG.tables.incident}`
   // To:
   `table/${SN_CONFIG.tables.universityRequest}`
   ```

---

## Step 6 — Create a ServiceNow Dashboard for Admin Portal

To match your Admin Portal design:

1. Go to **Self-Service → Dashboards** → **New**
2. Name: `University Admin Dashboard`
3. Add widgets:
   - **Gauge** – Assigned Tickets (state=1)
   - **Gauge** – In Progress (state=2)  
   - **List** – All university requests
4. Share with `University Admin` group

### Create an Inbound Email Action (optional)
Students can get email notifications when ticket state changes:
1. **System Notification → Notifications → New**
2. Table: `incident`, When to send: `Record Updated`
3. Condition: `Current.assigned_to.email != ""`
4. Add email template with ticket details

---

## Step 7 — Run and Test

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`, log in, and submit a test request. Then check your PDI:

**ServiceNow → Incident → All** — you should see the ticket created by UniAssist.

### Test the connection programmatically:
```js
import { testConnection } from './src/utils/serviceNowApi';
const result = await testConnection();
console.log(result); // { success: true, instance: 'https://dev12345...' }
```

---

## Step 8 — Build for Production

```bash
npm run build
```

> ⚠️ **Before deploying**: Move ServiceNow credentials to a backend proxy.  
> Never expose `VITE_SN_USER` / `VITE_SN_PASS` in a public deployment.

### Recommended production architecture:
```
React App → POST /api/create-ticket (your Node server) → ServiceNow REST API
```

---

## File Changes Summary

| File | What Changed |
|------|-------------|
| `src/utils/serviceNowApi.js` | **NEW** — Full ServiceNow REST integration |
| `src/utils/botLogic.js` | Updated `generateTicketId` + `getTicketConfirmation` to support real SN ticket IDs |
| `src/components/ChatInterface.jsx` | Replaced local ticket generation with `createServiceNowTicket()` call; graceful fallback if SN is offline |
| `src/components/Message.jsx` | Added "View in ServiceNow" link on ticket cards |
| `.env.example` | **NEW** — Environment variable template |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `401 Unauthorized` | Check `VITE_SN_USER` / `VITE_SN_PASS` in `.env` |
| `CORS error` in browser | Follow Step 3 — enable CORS in your PDI |
| Ticket created but no assignment group | Set `VITE_SN_GROUP` with the correct sys_id |
| PDI not responding | Log into developer.servicenow.com and wake up your instance |
| `403 Forbidden` | Your user lacks the `itil` or `admin` role — add it in User Administration |

---

## ServiceNow REST API Reference

| Operation | Endpoint |
|-----------|----------|
| Create ticket | `POST /api/now/table/incident` |
| Get ticket by number | `GET /api/now/table/incident?sysparm_query=number=INC0010034` |
| Update ticket | `PATCH /api/now/table/incident/{sys_id}` |
| Add work note | `PATCH /api/now/table/incident/{sys_id}` with `work_notes` field |

Full docs: https://docs.servicenow.com/bundle/latest-application-development/page/integrate/inbound-rest/concept/c_RESTAPI.html
