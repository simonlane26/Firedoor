# FirexCheck Features to Implement in Fire Door Inspector

Based on analysis of the FirexCheck fire extinguisher management system, here are the key features to replicate for fire door inspections.

---

## 1. QR Code System ✅ (Priority: CRITICAL)

### Current FirexCheck Implementation:
- **QR codes attached to each fire extinguisher**
- **Public verification page** - anyone can scan QR code to see compliance status
- **No login required** for public access
- **Auto-generated URLs**: `https://domain.com/verify/{door-id}`
- **Displays**:
  - Company branding (logo, name)
  - Compliance status badge (Green/Orange/Red)
  - Equipment details (location, type, rating)
  - Last inspection date & next due date
  - Certificate number
  - Verification timestamp

### For Fire Door Inspector:
- [ ] Add `qrCode` field to FireDoor model
- [ ] Create QR code generation service (using `qrcode` npm package)
- [ ] Add "Generate QR Codes" page in dashboard
- [ ] Create public verification route: `/verify/{door-id}`
- [ ] Build public verification page (no auth required)
- [ ] Show compliance status based on inspection dates
- [ ] Display door details, inspection history, certificate
- [ ] Allow bulk QR code generation for all doors in a building
- [ ] Provide printable QR code labels

---

## 2. Multi-Tenancy / Separate Sites ✅ (Priority: CRITICAL)

### Current FirexCheck Implementation:
- **Tenant model** with subdomain support
- Each tenant has:
  - Unique subdomain (`company1.firexcheck.com`)
  - Custom branding (logo, primary/secondary colors)
  - Separate user base
  - Isolated data
  - Individual Stripe billing
- **Site model** for multi-location management
- Users can have access to specific sites only

### For Fire Door Inspector:
- [ ] Add `Tenant` model to schema
  ```prisma
  model Tenant {
    id              String   @id @default(cuid())
    companyName     String
    subdomain       String   @unique
    logoUrl         String?
    primaryColor    String   @default("#dc2626")
    secondaryColor  String   @default("#991b1b")
    contactEmail    String?
    subscriptionPlan String  @default("trial")
    createdAt       DateTime @default(now())
    users           User[]
    buildings       Building[]
    doors           FireDoor[]
    inspections     Inspection[]
  }
  ```
- [ ] Update all models to include `tenantId`
- [ ] Add subdomain routing middleware
- [ ] Add tenant context to all API calls
- [ ] Build tenant registration/onboarding flow
- [ ] Add custom branding support (logo upload, color picker)
- [ ] Implement data isolation (ensure users only see their tenant's data)

---

## 3. Reporting Features ✅ (Priority: HIGH)

### Current FirexCheck Implementation:
- **Dashboard widgets** with KPIs
- **Compliance reports** (PDF export)
- **Inspection history reports**
- **Trend analysis** (charts, graphs)
- **Scheduled reports** (email delivery)
- **Export formats**: PDF, Excel, Word

### For Fire Door Inspector:
- [ ] Create Reports page
- [ ] Add compliance summary dashboard
  - Total doors registered
  - Doors inspected vs. pending
  - Pass/Fail/Requires Action breakdown
  - Upcoming inspections (next 30 days)
- [ ] Build PDF report generation
  - Inspection certificate per door
  - Building compliance report
  - Full inspection history report
- [ ] Add Excel export for inspection data
- [ ] Create charts/graphs:
  - Inspection results over time
  - Doors by status
  - Inspections by building
- [ ] Add date range filters
- [ ] Schedule automatic reports (weekly/monthly email)

---

## 4. Email Reminder System ✅ (Priority: HIGH)

### Current FirexCheck Implementation:
- **Automated inspection reminders** at 30, 14, 7, 1 days before due
- **Beautiful HTML email templates**
- **Color-coded urgency** (Red/Orange/Blue)
- **Sent to admins and managers** for each tenant
- **Scheduled via cron jobs** (daily at 9:00 AM)
- **SMTP configuration** (Gmail, SendGrid, etc.)

### For Fire Door Inspector:
- [ ] Install email packages: `nodemailer`, `@nestjs/schedule`
- [ ] Add email service with SMTP configuration
- [ ] Create HTML email templates for:
  - 3-month inspection reminders (communal doors)
  - 12-month inspection reminders (flat doors)
  - Overdue inspection alerts
- [ ] Build cron scheduler service
- [ ] Add reminder logic:
  - Check doors with `nextInspection` in 30/14/7/1 days
  - Send emails to tenant admins/managers
  - Log email delivery
- [ ] Add `.env` variables:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM="Fire Door Inspector <noreply@yourdomain.com>"
  ```

---

## 5. Role-Based Access Control ✅ (Priority: MEDIUM)

### Current FirexCheck Implementation:
- **Roles**: Admin, Manager, Inspector
- **Admin**: Full access, billing, user management
- **Manager**: View all, create inspections, manage sites
- **Inspector**: Conduct inspections only
- **Site-specific access**: Users can be restricted to certain sites

### For Fire Door Inspector:
- [ ] Update User model with proper roles
- [ ] Implement role-based guards/middleware
- [ ] Create permissions system:
  - `ADMIN`: Manage users, buildings, billing
  - `MANAGER`: View all, create inspections
  - `INSPECTOR`: Conduct inspections only
- [ ] Add user management page (Admin only)
- [ ] Implement site-level access control
- [ ] Add role selection during user creation

---

## 6. Photo Documentation ✅ (Priority: MEDIUM)

### Current FirexCheck Implementation:
- **Attach photos to extinguishers** (installation, damage)
- **Inspection photos** (before/after)
- **Photo galleries** per equipment
- **S3 storage integration** (AWS S3 or compatible)
- **Image compression** and optimization

### For Fire Door Inspector:
- [ ] Add `InspectionPhoto` model
  ```prisma
  model InspectionPhoto {
    id            String      @id @default(cuid())
    inspectionId  String
    photoUrl      String
    photoType     String      // "damage", "door_leaf", "hinges", etc.
    description   String?
    uploadedAt    DateTime    @default(now())
    inspection    Inspection  @relation(fields: [inspectionId], references: [id])
  }
  ```
- [ ] Add photo upload endpoint
- [ ] Configure S3 or local file storage
- [ ] Add image compression (using `sharp`)
- [ ] Update inspection form to support photo uploads
- [ ] Display photo gallery in inspection details
- [ ] Include photos in PDF reports

---

## 7. Subscription/Billing (Stripe) ✅ (Priority: LOW - Future)

### Current FirexCheck Implementation:
- **Stripe integration** for payments
- **Subscription tiers**: Trial, Basic, Pro, Enterprise
- **Invoice generation**
- **Usage limits** per plan
- **Billing portal** for customers

### For Fire Door Inspector (Future Phase):
- [ ] Integrate Stripe SDK
- [ ] Define subscription plans:
  - **Trial**: 30 days free, 10 doors
  - **Starter**: £29/month, 50 doors
  - **Professional**: £79/month, 200 doors
  - **Enterprise**: Custom pricing
- [ ] Add Stripe Customer Portal
- [ ] Implement usage limits
- [ ] Generate invoices
- [ ] Add billing page in dashboard

---

## 8. Advanced Features (From Roadmap)

### Mobile App (Future)
- React Native app for offline inspections
- Camera integration for photos
- QR code scanning
- Push notifications

### API & Integrations (Future)
- REST API for third-party integrations
- Webhooks for real-time events
- Google Calendar/Outlook sync
- Zapier integration

### Predictive Maintenance (Future)
- ML models to predict when doors need attention
- Failure pattern analysis
- Proactive alerts

---

## Implementation Priority Order

### Phase 1: Foundation (Now)
1. ✅ Basic inspection functionality (DONE)
2. 🔄 Multi-tenancy support
3. 🔄 QR code generation & verification
4. 🔄 Email reminders

### Phase 2: Core Features (Next 2 weeks)
5. Reporting & PDF exports
6. Photo documentation
7. Role-based access
8. Dashboard analytics

### Phase 3: Growth (Next month)
9. Subscription/billing
10. Public API
11. Advanced reporting
12. Mobile optimization

### Phase 4: Scale (Future)
13. Mobile app
14. Integrations
15. AI features
16. International expansion

---

## Key Differences: Fire Extinguishers vs. Fire Doors

| Feature | Fire Extinguishers | Fire Doors |
|---------|-------------------|------------|
| **Inspection Frequency** | Annual | 3-month (communal) or 12-month (flat) |
| **Inspection Type** | Maintenance checks | Regulatory compliance checks |
| **Key Checks** | Pressure, seals, signage | Gaps, hinges, seals, closing mechanism |
| **Regulations** | BS 5306 | Fire Safety Order 2005 |
| **Certification** | Annual certificate | Building height dependent |
| **QR Use Case** | Service history | Compliance verification |

---

## Next Steps

1. **Start with multi-tenancy** - This is foundational for SaaS
2. **Implement QR codes** - High value, relatively simple
3. **Add email reminders** - Critical for compliance
4. **Build reporting** - Customers will need compliance reports
5. **Add photos** - Visual documentation is important
6. **Plan billing** - Once MVP is proven

Would you like me to start implementing any of these features?
