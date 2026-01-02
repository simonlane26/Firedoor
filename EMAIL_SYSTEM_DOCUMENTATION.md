# Email Reminder System Documentation

## Overview
Automated email reminder system for fire door inspections, sending notifications to admins and managers when inspections are due or overdue.

---

## Features

✅ **Automated Reminders** - Send emails at configurable intervals (30, 14, 7, 1 days before due)
✅ **Overdue Alerts** - Critical notifications for overdue inspections
✅ **Beautiful HTML Templates** - Color-coded by urgency (Red/Orange/Blue)
✅ **Multi-Tenant Support** - Separate reminders per organization
✅ **Batch Processing** - Send reminders for multiple doors in one email
✅ **Role-Based** - Sends to ADMIN and MANAGER users only
✅ **Inspection Scheduling** - Automatic calculation of next inspection dates

---

## Inspection Schedules

Based on **Fire Safety (England) Regulations 2022**:

| Door Type | Inspection Frequency |
|-----------|---------------------|
| **Flat Entrance Doors** | 12 months |
| **Communal Doors** (Stairway, Corridor, Lobby) | 3 months |
| **Plant Room / Service Riser** | 3 months |

---

## Components

### 1. Email Service
**File:** [lib/email.ts](lib/email.ts)

- Nodemailer SMTP configuration
- `sendEmail()` - Send emails with HTML content
- `verifyEmailConfig()` - Test SMTP connection

### 2. Email Templates
**File:** [lib/email-templates.ts](lib/email-templates.ts)

- `getInspectionReminderTemplate()` - Main template with urgency levels
- Beautiful HTML with responsive design
- Color-coded headers:
  - **Red** - Overdue/Critical
  - **Orange** - Urgent (7 days or less)
  - **Blue** - Upcoming (30 days)

### 3. Reminder Logic
**File:** [lib/reminders.ts](lib/reminders.ts)

Functions:
- `calculateNextInspectionDate()` - Calculate next inspection based on door type
- `sendInspectionReminders(days)` - Send reminders for doors due in X days
- `sendOverdueReminders()` - Send critical alerts for overdue inspections
- `updateNextInspectionDates()` - Update all doors with calculated next inspection dates

### 4. API Endpoint
**File:** [app/api/reminders/route.ts](app/api/reminders/route.ts)

**POST /api/reminders** - Trigger reminder actions

Actions:
- `send` - Send reminders for doors due in X days
- `overdue` - Send overdue alerts
- `update` - Update next inspection dates
- `all` - Run all reminder schedules

**GET /api/reminders** - Check reminder status (Admin only)

---

## Configuration

### Environment Variables (.env)

```env
# Email / SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Fire Door Inspector <noreply@firedoorinspector.com>"

# Cron Secret (for automated reminder scheduling)
CRON_SECRET="your-cron-secret-key-change-this"
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use the App Password as `SMTP_PASS` in .env

### Other Email Providers

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Mailgun:**
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.com"
SMTP_PASS="your-mailgun-password"
```

**AWS SES:**
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
```

---

## Usage

### Manual Trigger (Admin Only)

#### Send 30-Day Reminders
```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"action": "send", "daysThreshold": 30}'
```

#### Send Overdue Alerts
```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"action": "overdue"}'
```

#### Run All Reminders
```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"action": "all"}'
```

#### Update Next Inspection Dates
```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"action": "update"}'
```

### Automated Scheduling (Cron Job)

Create a cron job to run daily at 9:00 AM:

```bash
# Linux/Mac - crontab -e
0 9 * * * curl -X POST https://yourdomain.com/api/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-cron-secret-key-change-this" \
  -d '{"action": "all"}'
```

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 9:00 AM
4. Action: Start a program
5. Program: `curl.exe`
6. Arguments:
```
-X POST https://yourdomain.com/api/reminders -H "Content-Type: application/json" -H "Authorization: Bearer your-cron-secret-key-change-this" -d "{\"action\": \"all\"}"
```

### External Cron Services

**Vercel Cron** (for Vercel deployments):
```json
// vercel.json
{
  "crons": [{
    "path": "/api/reminders",
    "schedule": "0 9 * * *"
  }]
}
```

**GitHub Actions:**
```yaml
# .github/workflows/reminders.yml
name: Send Daily Reminders
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Reminders
        run: |
          curl -X POST https://yourdomain.com/api/reminders \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -d '{"action": "all"}'
```

**EasyCron.com / Cron-Job.org:**
1. Create account
2. Add new cron job
3. URL: `https://yourdomain.com/api/reminders`
4. Method: POST
5. Headers: `Authorization: Bearer your-cron-secret`, `Content-Type: application/json`
6. Body: `{"action": "all"}`
7. Schedule: Daily at 9:00 AM

---

## Email Template Preview

### Overdue Email (Critical - Red)
```
Subject: 🚨 OVERDUE: 3 Fire Door Inspections

Header: Red background with "OVERDUE - IMMEDIATE ACTION REQUIRED"
Content:
- List of overdue doors
- Days overdue in red
- Critical warning box
- "View Dashboard" button
```

### Upcoming Email (Blue)
```
Subject: 🚪 Fire Door Inspection Reminder - 5 Doors

Header: Blue background with "UPCOMING INSPECTION"
Content:
- List of doors
- Days remaining
- Action required box
- "View Dashboard" button
```

---

## Testing

### Test Email Configuration
```typescript
import { verifyEmailConfig } from '@/lib/email'

const isValid = await verifyEmailConfig()
console.log('Email configured:', isValid)
```

### Send Test Email
```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1><p>Email is working!</p>'
})
```

### Test Reminder Logic
```typescript
import { sendInspectionReminders } from '@/lib/reminders'

// Send reminders for doors due in 7 days
const stats = await sendInspectionReminders(7)
console.log('Emails sent:', stats.emailsSent)
console.log('Doors reminded:', stats.doorsReminded)
```

---

## Workflow

1. **Inspection Completed**
   - Inspector marks inspection as COMPLETED with PASS result
   - System calculates next inspection date (3 or 12 months)
   - Stores `nextInspectionDate` in FireDoor record

2. **Daily Cron Job (9:00 AM)**
   - Updates all next inspection dates
   - Checks for overdue inspections → sends critical emails
   - Checks for inspections due in 30/14/7/1 days → sends reminders

3. **Email Sent**
   - Groups doors by tenant
   - Sends one email per tenant with all their due doors
   - Recipients: All ADMIN and MANAGER users for that tenant
   - Color-coded by urgency

4. **User Action**
   - Receives email
   - Clicks "View Dashboard"
   - Schedules inspections

---

## Database Schema

### FireDoor Model
```prisma
model FireDoor {
  // ... other fields
  nextInspectionDate    DateTime?  // Calculated automatically
}
```

---

## API Response Examples

### Successful Reminder Send
```json
{
  "success": true,
  "action": "send",
  "daysThreshold": 30,
  "stats": {
    "emailsSent": 2,
    "doorsReminded": 15,
    "tenantReminders": {
      "tenant-id-1": {
        "tenantName": "ABC Building Management",
        "doorCount": 10
      },
      "tenant-id-2": {
        "tenantName": "XYZ Properties",
        "doorCount": 5
      }
    }
  }
}
```

### Reminder Status Check
```json
{
  "overdueCount": 5,
  "due30Days": 20,
  "due7Days": 8
}
```

---

## Troubleshooting

### Emails Not Sending

1. **Check SMTP Credentials**
   ```bash
   # Test connection
   curl -X POST http://localhost:3000/api/test-email
   ```

2. **Check Gmail Settings**
   - 2FA enabled?
   - App password generated?
   - "Less secure app access" NOT needed with app passwords

3. **Check Firewall**
   - Port 587 open?
   - ISP blocking SMTP?

4. **Check Logs**
   ```bash
   # Look for errors in console
   npm run dev
   ```

### Reminders Not Triggering

1. **Check Next Inspection Dates**
   ```sql
   SELECT doorNumber, nextInspectionDate
   FROM fire_doors
   WHERE nextInspectionDate IS NOT NULL;
   ```

2. **Manually Update Dates**
   ```bash
   curl -X POST http://localhost:3000/api/reminders \
     -d '{"action": "update"}'
   ```

3. **Check Cron Job Running**
   - Verify cron service is active
   - Check cron logs
   - Test manual trigger first

---

## Future Enhancements

- [ ] SMS notifications (Twilio integration)
- [ ] Push notifications (web push)
- [ ] Customizable reminder thresholds per tenant
- [ ] Email delivery tracking
- [ ] Unsubscribe functionality
- [ ] Email templates customization per tenant
- [ ] Reminder history log
- [ ] Escalation rules (remind again if not actioned)

---

## Summary

The email reminder system is now fully implemented with:

✅ SMTP email service
✅ Beautiful HTML templates
✅ Automatic inspection scheduling
✅ Overdue and upcoming reminders
✅ Multi-tenant support
✅ API endpoints for manual/automated triggers
✅ Role-based notifications (Admin/Manager)
✅ Ready for cron job scheduling

**To activate:**
1. Update SMTP credentials in `.env`
2. Test with manual API call
3. Set up cron job for daily reminders
