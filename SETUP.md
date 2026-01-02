# Fire Door Inspector - Setup Guide

This guide will walk you through setting up the Fire Door Inspector application from scratch.

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages.

### 2. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Create a new database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fire_door_inspector;

# Exit psql
\q
```

#### Option B: Docker PostgreSQL (Recommended for development)

```bash
docker run --name fire-door-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=fire_door_inspector \
  -p 5432:5432 \
  -d postgres:16
```

#### Option C: Cloud Database (Recommended for production)

Use a managed PostgreSQL service like:
- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/)
- AWS RDS, Azure Database, Google Cloud SQL

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update the values:

```env
# Database - Update with your actual database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/fire_door_inspector?schema=public"

# NextAuth - Generate a secure secret
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Initialize Database

Run the Prisma migration to create the database schema:

```bash
npm run db:migrate
```

This will:
- Create all tables (users, buildings, fire_doors, inspections)
- Set up relationships and indexes
- Generate the Prisma client

### 5. Create Your First Admin User

You have two options:

#### Option A: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
```bash
npm run db:studio
```

2. Navigate to the `User` model
3. Click "Add record"
4. Fill in:
   - **email**: your-email@example.com
   - **name**: Your Name
   - **passwordHash**: [Use the hash generated below]
   - **role**: ADMIN

**Generate password hash:**
```bash
# Install bcryptjs globally if needed
npm install -g bcryptjs

# Or use Node.js directly:
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10))"
```

#### Option B: Using the Admin Script (Coming Soon)

```bash
npx ts-node scripts/create-admin.ts your-email@example.com YourPassword123 "Your Name"
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 7. First Login

1. Navigate to http://localhost:3000
2. You'll be redirected to `/login`
3. Enter the email and password you created
4. You'll be redirected to the dashboard

## Quick Start Workflow

Once logged in:

1. **Add a Building**
   - Click "Add New Building"
   - Fill in building details (name, address, height, etc.)
   - Submit

2. **Register Fire Doors**
   - Click "Register Fire Door"
   - Select the building
   - Enter door details (number, location, type, rating)
   - Mark features (intumescent strips, smoke seals, etc.)
   - Submit

3. **Conduct Inspections**
   - Click "Start New Inspection"
   - Select building and door
   - Choose inspection type (3-month or 12-month based on door type)
   - Complete the checklist
   - Submit

## Database Management Commands

Useful commands for database operations:

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Push schema changes without migration (dev only)
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Production Deployment

### Environment Variables for Production

Update your `.env` for production:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Build and Start

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deployment Platforms

The app can be deployed to:

1. **Vercel** (Recommended)
   - Connect your Git repository
   - Add environment variables
   - Deploy automatically

2. **Railway**
   - Connect repository
   - Add PostgreSQL service
   - Deploy

3. **Heroku**
   - Add Heroku Postgres addon
   - Set environment variables
   - Deploy

4. **Self-hosted**
   - Use PM2 or similar process manager
   - Set up reverse proxy (nginx/Apache)
   - Configure SSL certificate

## Troubleshooting

### Database Connection Issues

**Error: Can't reach database server**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: Authentication failed**
- Verify username and password in DATABASE_URL
- Check PostgreSQL user permissions

### Prisma Issues

**Error: Prisma Client is not generated**
```bash
npm run db:generate
```

**Error: Migration failed**
```bash
# Reset and try again (WARNING: deletes data)
npx prisma migrate reset
npm run db:migrate
```

### NextAuth Issues

**Error: NEXTAUTH_SECRET is missing**
- Ensure NEXTAUTH_SECRET is set in `.env`
- Restart dev server after adding

**Error: Can't sign in**
- Check password hash was generated correctly
- Verify user exists in database
- Check browser console for errors

### Build Issues

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: Type errors**
```bash
# Regenerate Prisma types
npm run db:generate
```

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Use HTTPS in production
- [ ] Set secure database credentials
- [ ] Enable database backups
- [ ] Review user permissions
- [ ] Configure CORS appropriately
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## Support

For issues or questions:

1. Check the [README.md](README.md) for features and usage
2. Review this setup guide
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check NextAuth documentation: https://next-auth.js.org

## Next Steps

Once set up:

1. Explore the dashboard
2. Add your buildings and fire doors
3. Conduct test inspections
4. Review compliance reports
5. Customize for your organization

---

**You're now ready to conduct compliant fire door inspections!**
