# Fire Door Inspector

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive fire door inspection management system compliant with **Fire Safety (England) Regulations 2022**.

## Features

### Core Features
- **Multi-tenant system** with subdomain support and complete data isolation
- **User authentication** with NextAuth.js (Admin, Manager, Inspector roles)
- **Building management** with detailed property information
- **Fire door registration** with comprehensive details and QR code generation
- **Inspection recording** with dynamic checklists and automated result calculation
- **Mobile-first responsive design** optimized for field inspections

### Reporting & Analytics
- **PDF certificates** for individual inspections with professional formatting
- **Building compliance reports** in PDF format with full door inventory
- **Excel exports** with color-coded inspection data and multi-sheet summaries
- **Analytics dashboard** with interactive charts (Recharts) and real-time statistics
- **Compliance tracking** with overdue alerts and status breakdowns

### Data Management
- **CSV bulk import** for buildings and fire doors with validation
- **CSV export** for all data types (buildings, doors, inspections)
- **Downloadable templates** with examples and import guides
- **Row-level validation** and comprehensive error reporting
- **Duplicate detection** and data integrity checks

### Compliance & Automation
- **Automated email reminders** for upcoming inspections (configurable days threshold)
- **Overdue inspection alerts** via SMTP email with HTML templates
- **Inspection scheduling** based on door type (12-month/3-month cycles per regulations)
- **QR code system** for quick door identification and inspection access
- **Custom branding** per tenant (logos, favicon, colors, custom CSS)

### Administration
- **Tenant settings** for organization configuration
- **Branding customization** with logo upload, 5-color palette, and CSS variables
- **User management** with role-based permissions
- **In-app documentation** with comprehensive guides and troubleshooting

## Inspection Features

The app creates dynamic checklists based on door configuration:

### Core Checks (All Doors)
- Visual damage or defects assessment
- Door closure from any angle
- Frame gap measurements (4mm compliance)
- Hinge security and count
- Self-closing device functionality

### Conditional Checks
- **Intumescent strips** - only shown if door has them
- **Smoke seals** - only shown if door has them
- **Letterbox** - only shown if door has one
- **Air transfer grille** - only shown for plant room doors
- **Glazing** - only shown if door has glass

### Access Denial Tracking
- Record when access is denied
- Document reason for non-inspection
- Complies with regulation 10 record-keeping requirements

## Database Schema

### Buildings
- Multi-building management
- Building type classification
- Storey height tracking for compliance rules

### Fire Doors
- Unique door numbering per building
- Door type and fire rating
- Feature tracking (strips, seals, letterbox, etc.)
- Installation date recording

### Inspections
- Complete inspection history
- Photo upload capability (paths stored)
- Inspector assignment
- Status tracking (Pending, In Progress, Completed, Requires Action)
- Automated result calculation
- Priority flagging

### Users
- Email/password authentication
- Role-based access (Admin, Manager, Inspector)
- Organization assignment

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/fire-door-inspector.git
cd fire-door-inspector
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Your Company <noreply@yourcompany.com>"
```

4. **Initialize the database**
```bash
npx prisma db push
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

### First-Time Setup

1. **Configure Tenant**
   - Navigate to [Settings](http://localhost:3000/settings/tenant)
   - Enter company name, subdomain, contact details
   - Click "Save Settings"

2. **Customize Branding** (Optional)
   - Navigate to [Branding Settings](http://localhost:3000/settings/branding)
   - Upload logo and favicon
   - Customize colors
   - Click "Save Changes"

3. **Import Data** (Optional)
   - Navigate to [CSV Import/Export](http://localhost:3000/csv)
   - Download templates
   - Fill in your data
   - Upload CSV files

4. **Start Using**
   - Add buildings
   - Register fire doors
   - Perform inspections
   - Generate reports

---

## Documentation

Comprehensive documentation is available in-app at `/documentation` or in the following files:

- **[Getting Started Guide](GETTING_STARTED.md)** - Quick start and initial setup
- **[CSV Import/Export](CSV_IMPORT_EXPORT_DOCUMENTATION.md)** - Bulk data operations
- **[Email System](EMAIL_SYSTEM_DOCUMENTATION.md)** - Automated reminders and alerts
- **[Reporting System](REPORTING_SYSTEM_DOCUMENTATION.md)** - PDF and Excel reports
- **[Branding System](BRANDING_SYSTEM_DOCUMENTATION.md)** - Custom logo and colors
- **[Multi-Tenancy](MULTI_TENANCY_IMPLEMENTATION.md)** - Multi-tenant architecture
- **[Project Summary](PROJECT_SUMMARY.md)** - Technical overview

---

## Technology Stack

### Frontend
- **Next.js 15.5.9** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database toolkit
- **SQLite** (dev) / **PostgreSQL** (production)

### Features
- **Nodemailer** - Email sending
- **PDFKit** - PDF generation
- **ExcelJS** - Excel exports
- **PapaParse** - CSV parsing
- **QRCode** - QR code generation

---

## User Roles

### ADMIN
- Full system access
- Manage tenant settings and branding
- Import/export data
- Manage users, buildings, doors
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

## Database Schema

### Key Models

**Tenant**
- Multi-tenant isolation
- Branding configuration (logo, colors, custom CSS)
- Contact information
- Settings and preferences

**User**
- Email/password authentication
- Role-based access (ADMIN, MANAGER, INSPECTOR)
- Tenant association
- User profile

**Building**
- Building details (name, address, type)
- Number of storeys
- Contact information (name, email, phone)
- Tenant association

**FireDoor**
- Door number and location
- Fire rating (FD30, FD60, FD90, FD120)
- Door type (Flat Entrance, Communal, Stairway, etc.)
- Installation date
- Manufacturer
- Building association

**Inspection**
- Inspection date and time
- Inspector details
- Comprehensive checklist (20+ fields)
- Overall result (PASS, FAIL, REQUIRES_ACTION)
- Next inspection date (auto-calculated)
- Photo paths
- Fire door association

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Buildings
- `GET /api/buildings` - List all buildings
- `POST /api/buildings` - Create building
- `GET /api/buildings/[id]` - Get building details
- `PATCH /api/buildings/[id]` - Update building
- `DELETE /api/buildings/[id]` - Delete building

### Fire Doors
- `GET /api/doors` - List all doors
- `POST /api/doors` - Register fire door
- `GET /api/doors/[id]` - Get door details
- `PATCH /api/doors/[id]` - Update door
- `DELETE /api/doors/[id]` - Delete door

### Inspections
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection
- `GET /api/inspections/[id]` - Get inspection
- `PATCH /api/inspections/[id]` - Update inspection
- `DELETE /api/inspections/[id]` - Delete inspection

### Reports
- `GET /api/reports` - Get statistics and analytics
- `GET /api/reports/pdf/inspection/[id]` - Download PDF certificate
- `GET /api/reports/pdf/building/[id]` - Download building report
- `GET /api/reports/excel/inspections` - Download Excel (all inspections)
- `GET /api/reports/excel/summary` - Download Excel summary

### CSV Import/Export
- `POST /api/csv/import/buildings` - Import buildings CSV
- `POST /api/csv/import/doors` - Import doors CSV
- `GET /api/csv/export/buildings` - Export buildings CSV
- `GET /api/csv/export/doors` - Export doors CSV
- `GET /api/csv/export/inspections` - Export inspections CSV
- `GET /api/csv/templates?type=buildings|doors|guide` - Download templates

### Branding
- `GET /api/branding` - Get branding configuration
- `PATCH /api/branding` - Update branding (Admin only)
- `POST /api/branding/upload-logo` - Upload logo/favicon (Admin only)

### Email Reminders
- `POST /api/reminders` - Trigger reminders (Admin or Cron)

---

## Fire Safety Compliance

### Inspection Cycles (Fire Safety England Regulations 2022)

| Door Type | Inspection Cycle | Regulation |
|-----------|------------------|------------|
| **Flat Entrance Doors** | 12 months | Schedule 2, Part 1 |
| **Communal Doors** | 3 months | Schedule 2, Part 2 |
| - Stairways | 3 months | Schedule 2, Part 2 |
| - Corridors | 3 months | Schedule 2, Part 2 |
| - Riser Cupboards | 3 months | Schedule 2, Part 2 |
| - Meter Cupboards | 3 months | Schedule 2, Part 2 |

### Inspection Checklist

The system records comprehensive inspection data:
- Door construction and certification
- Damage assessment (gaps, holes, delamination)
- Door closure mechanism
- Frame gaps and seals (4mm compliance)
- Hinges condition and security
- Intumescent strips
- Smoke seals
- Glazing integrity
- Letter plates and air transfer grilles
- Overall compliance result (PASS/FAIL/REQUIRES_ACTION)

### Record Keeping
- All inspections permanently recorded with timestamps
- Inspector assignment and audit trail
- Photo evidence capability
- Access denial tracking with reasons
- Next inspection dates auto-calculated

---

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Configure `.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="Your Company <noreply@yourcompany.com>"
```

### Other Providers

**SendGrid**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Mailgun**
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@yourdomain.com"
SMTP_PASS="your-mailgun-smtp-password"
```

### Automated Reminders

Set up a cron job to trigger daily reminders:
```bash
# Daily at 9 AM
0 9 * * * curl -X POST http://localhost:3000/api/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "all"}'
```

---

## Deployment

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="generate-a-secure-random-secret"
NEXTAUTH_URL="https://yourdomain.com"

SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="Your Company <noreply@yourcompany.com>"
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma db push   # Push schema changes to database
```

### Project Structure

```
fire-door-inspector/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── buildings/         # Buildings pages
│   ├── doors/             # Fire doors pages
│   ├── inspections/       # Inspections pages
│   ├── reports/           # Reports & analytics
│   ├── csv/               # CSV import/export
│   ├── settings/          # Settings pages
│   └── documentation/     # Documentation hub
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication config
│   ├── prisma.ts         # Prisma client
│   ├── email.ts          # Email service
│   ├── pdf-reports.ts    # PDF generation
│   ├── excel-reports.ts  # Excel generation
│   ├── csv-import.ts     # CSV import logic
│   ├── csv-export.ts     # CSV export logic
│   └── branding.ts       # Branding service
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── public/               # Static files
│   └── uploads/          # File uploads
├── types/                # TypeScript types
└── middleware.ts         # Next.js middleware
```

---

## Security

- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: NextAuth.js built-in protection
- **Role-Based Access Control**: Enforced at API and UI levels
- **Tenant Isolation**: All queries scoped to tenant
- **File Upload Validation**: Type, size, and content checks
- **CSS Sanitization**: Dangerous patterns removed from custom CSS
- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: Secure HTTP-only cookies

---

## Troubleshooting

### "No tenant found" Error

**Solution**: Navigate to `/settings/tenant` and configure your organization details.

### Import CSV Not Working

**Solutions**:
- Ensure you're logged in as ADMIN or MANAGER
- Check CSV format matches template
- Verify building names exist before importing doors
- Review error messages for specific validation issues

### Email Not Sending

**Solutions**:
- Verify SMTP credentials in `.env`
- Test SMTP connection with reminders API
- Check spam folder for test emails
- Review email system documentation

### Reports Not Loading

**Solutions**:
- Ensure tenant is configured
- Add buildings and doors first
- Perform some inspections
- Check browser console for errors

### Branding Not Applying

**Solutions**:
- Ensure you clicked "Save Changes"
- Hard refresh browser (Ctrl+F5)
- Check "Enable custom branding" is checked
- Clear browser cache if needed

---

## Support

For issues or questions:
1. Check the [Documentation](http://localhost:3000/documentation)
2. Review relevant documentation files in this repository
3. Check application logs in terminal
4. Review troubleshooting sections in documentation

---

## License

MIT License - See LICENSE file for details

---

## Project Stats

- **Lines of Code**: 15,000+
- **Components**: 50+
- **API Endpoints**: 40+
- **Database Models**: 5 core models
- **Documentation Pages**: 7
- **Features**: 20+ major features

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

Compliant with:
- Fire Safety (England) Regulations 2022
- Fire Safety Act 2021
- Regulatory Reform (Fire Safety) Order 2005

---

**Fire Door Inspector** - Professional compliance management for fire safety regulations.
