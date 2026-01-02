# Getting Started with Fire Door Inspector

## Quick Start Guide

Welcome to the Fire Door Inspector application! This guide will help you get up and running.

---

## Initial Setup

### Step 1: Set Up Your Tenant

Before you can use the application features, you need to configure your organization (tenant).

1. **Navigate to Tenant Settings**
   - Go to [http://localhost:3000/settings/tenant](http://localhost:3000/settings/tenant)

2. **Configure Your Organization**
   - Company Name: Your organization name
   - Subdomain: A unique identifier (lowercase, no spaces)
   - Contact Email: Your organization's contact email
   - Contact Phone: Your organization's phone number

3. **Save Settings**
   - Click "Save Settings" button
   - This creates your tenant in the database

### Step 2: Customize Your Branding (Optional)

Once your tenant is configured, you can customize the application's appearance.

1. **Navigate to Branding Settings**
   - Go to [http://localhost:3000/settings/branding](http://localhost:3000/settings/branding)

2. **Customize Your Brand**
   - Upload your logo (PNG, JPG, SVG - max 2MB)
   - Upload favicon (PNG, ICO - max 2MB)
   - Customize colors:
     - Primary Color: Main brand color
     - Secondary Color: Secondary actions
     - Accent Color: Highlights and alerts
     - Text Color: Body text
     - Background Color: Page backgrounds

3. **Preview Changes**
   - See live preview on the right side
   - Adjust colors until satisfied

4. **Save Branding**
   - Click "Save Changes" to apply

### Step 3: Import Your Data (Optional)

If you have existing building and door data, you can bulk import it via CSV.

1. **Navigate to CSV Import**
   - Go to [http://localhost:3000/csv](http://localhost:3000/csv)

2. **Download Templates**
   - Click "Download Template" for buildings
   - Click "Download Template" for fire doors
   - Open templates in Excel or text editor

3. **Fill in Your Data**
   - Follow the template format exactly
   - See [CSV_IMPORT_EXPORT_DOCUMENTATION.md](CSV_IMPORT_EXPORT_DOCUMENTATION.md) for details

4. **Import Buildings First**
   - Upload buildings CSV
   - Wait for import to complete
   - Review any errors

5. **Import Fire Doors**
   - Upload fire doors CSV
   - Wait for import to complete
   - Review any errors

---

## Application Features

### Dashboard
- Overview of compliance status
- Quick statistics (total doors, compliance rate, overdue inspections)
- Quick actions menu
- Recent activity

**Access:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Buildings Management
- Add/edit/view buildings
- Building details and contact information
- List of fire doors per building

**Access:** [http://localhost:3000/buildings](http://localhost:3000/buildings)

### Fire Doors Management
- Register new fire doors
- View door details and inspection history
- Schedule inspections
- Generate QR codes for each door

**Access:** [http://localhost:3000/doors](http://localhost:3000/doors)

### Inspections
- Record new inspections
- View inspection history
- Download inspection certificates (PDF)
- Track compliance status

**Access:** [http://localhost:3000/inspections](http://localhost:3000/inspections)

### QR Code System
- Generate QR codes for fire doors
- Print QR code labels
- Scan codes for quick inspection access
- Bulk generate for multiple doors

**Access:** [http://localhost:3000/qr-codes](http://localhost:3000/qr-codes)

### Reports & Analytics
- Compliance statistics and trends
- Visual charts and graphs
- Export to PDF and Excel
- Building compliance reports

**Access:** [http://localhost:3000/reports](http://localhost:3000/reports)

### CSV Import/Export
- Bulk import buildings and doors
- Export all data to CSV
- Download templates
- Import validation and error reporting

**Access:** [http://localhost:3000/csv](http://localhost:3000/csv)

### Branding Settings
- Customize logo and colors
- Upload favicon
- Custom CSS (advanced)
- Live preview of changes

**Access:** [http://localhost:3000/settings/branding](http://localhost:3000/settings/branding)

### Email Reminder System
- Automated inspection reminders
- Overdue inspection alerts
- Configurable reminder schedules
- HTML email templates

**See:** [EMAIL_SYSTEM_DOCUMENTATION.md](EMAIL_SYSTEM_DOCUMENTATION.md)

---

## User Roles

### ADMIN
- Full system access
- Manage tenant settings
- Manage branding
- Import/export data
- Manage all users, buildings, doors
- View and generate reports

### MANAGER
- Import/export data
- Manage buildings and doors
- View reports
- Schedule inspections
- Cannot modify tenant/branding settings

### INSPECTOR
- Record inspections
- View assigned doors
- Export data
- Cannot import data or modify settings

---

## Inspection Cycles

The application follows **Fire Safety (England) Regulations 2022**:

- **Flat Entrance Doors:** 12-month inspection cycle
- **Communal Doors:** 3-month inspection cycle
  - Stairways
  - Corridors
  - Riser cupboards
  - Meter cupboards

Next inspection dates are calculated automatically based on door type.

---

## Common Tasks

### Add a New Building

1. Go to Dashboard → "Add New Building"
2. Fill in building details:
   - Name, address, postcode
   - Building type
   - Number of storeys
   - Contact information
3. Click "Save"

### Register a Fire Door

1. Go to Dashboard → "Register Fire Door"
2. Select building
3. Enter door details:
   - Door number
   - Location
   - Fire rating (FD30, FD60, FD90, FD120)
   - Door type
   - Installation date (optional)
4. Click "Save"

### Perform an Inspection

1. Go to Dashboard → "Start New Inspection"
2. Select fire door
3. Complete inspection form:
   - Door construction
   - Certification
   - Damage assessment
   - Door closure test
   - Frame gaps
   - Hinges condition
   - Intumescent strips
   - Smoke seals
   - Overall result (PASS/FAIL)
4. Click "Submit Inspection"

### Generate QR Codes

1. Go to QR Codes page
2. Select doors to generate codes for
3. Click "Generate QR Codes"
4. Print QR code labels
5. Attach labels to doors

### Download Reports

1. Go to Reports page
2. View analytics and statistics
3. Click "Export Inspections" for detailed Excel
4. Click "Export Summary" for summary Excel
5. Click building name to download building PDF report

---

## Troubleshooting

### "No tenant found" Error

**Problem:** You see errors about no tenant configured

**Solution:**
1. Go to [http://localhost:3000/settings/tenant](http://localhost:3000/settings/tenant)
2. Fill in all required fields
3. Click "Save Settings"
4. Refresh the page

### Cannot Import CSV

**Problem:** Import button is disabled

**Solution:**
- Only ADMIN and MANAGER roles can import
- Ensure you're logged in as ADMIN or MANAGER
- Check that you've selected a CSV file

### Branding Not Applying

**Problem:** Branding changes not visible

**Solution:**
1. Ensure you clicked "Save Changes"
2. Hard refresh browser (Ctrl+F5)
3. Check "Enable custom branding" is checked
4. Clear browser cache if needed

### Reports Not Loading

**Problem:** Reports page shows errors

**Solution:**
1. Ensure tenant is configured
2. Add some buildings and doors
3. Perform some inspections
4. Refresh the page

---

## Environment Setup

### SMTP Email Configuration

To enable email reminders, configure SMTP in `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Your Company <noreply@yourcompany.com>"
```

See [EMAIL_SYSTEM_DOCUMENTATION.md](EMAIL_SYSTEM_DOCUMENTATION.md) for details.

### Cron Job for Automated Reminders

Set up a cron job to trigger automatic reminders:

```bash
# Daily at 9 AM - Send upcoming inspection reminders
0 9 * * * curl -X POST http://localhost:3000/api/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "all"}'
```

---

## Documentation

- [CSV Import/Export](CSV_IMPORT_EXPORT_DOCUMENTATION.md)
- [Email System](EMAIL_SYSTEM_DOCUMENTATION.md)
- [Reporting System](REPORTING_SYSTEM_DOCUMENTATION.md)
- [Branding System](BRANDING_SYSTEM_DOCUMENTATION.md)
- [Multi-Tenancy](MULTI_TENANCY_IMPLEMENTATION.md)
- [Project Summary](PROJECT_SUMMARY.md)

---

## Support

For issues or questions:
1. Check the relevant documentation above
2. Review the troubleshooting section
3. Check the application logs in terminal
4. Refer to the technical documentation in the docs folder

---

## Next Steps

1. ✅ **Set up your tenant** at Settings
2. ✅ **Customize branding** (optional)
3. ✅ **Add your first building**
4. ✅ **Register fire doors**
5. ✅ **Perform inspections**
6. ✅ **Generate QR codes**
7. ✅ **View reports**
8. ✅ **Configure email reminders** (optional)
9. ✅ **Import existing data** via CSV (optional)

You're now ready to start using Fire Door Inspector!

---

## Current Application State

**✅ Completed Features:**
- Multi-tenant system
- User authentication and roles
- Building management
- Fire door registration
- Inspection recording system
- QR code generation
- Email reminder system
- Reports and analytics
- CSV import/export
- Custom branding

**🚀 Ready to Use:**
The application is fully functional and ready for production use after tenant setup.

**📝 Note:**
The 400 errors you see in the console are expected before tenant configuration. They will disappear once you set up your tenant at Settings.
