# Railway Deployment Guide for DoorCompliance.co.uk

## Prerequisites

1. **Railway Account**
   - Sign up at https://railway.app/
   - Connect your GitHub account

2. **GitHub Repository**
   - Push your code to GitHub
   - Make sure `.env` is in `.gitignore` (it should be already)

3. **Database Ready**
   - Railway will provide PostgreSQL database

---

## Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Railway deployment"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/fire-door-inspector.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create New Project in Railway

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `fire-door-inspector` repository
5. Railway will automatically detect it's a Next.js app

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will provision a database automatically

### Step 4: Configure Environment Variables

Click on your app service → **Variables** tab and add these:

#### Required Variables:

```bash
# Database (Railway will auto-populate this from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=your-generated-secret-here

# AWS S3 (for file uploads)
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

# Node Environment
NODE_ENV=production
```

#### Generate NEXTAUTH_SECRET:

Run this in your terminal:
```bash
openssl rand -base64 32
```

Or use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 5: Link Database to App

1. Click on your app service
2. Go to **Settings** → **Service Variables**
3. Add a reference to the PostgreSQL database:
   - Click **"+ New Variable"**
   - Select **"Add Reference"**
   - Choose your PostgreSQL database
   - Select `DATABASE_URL`

### Step 6: Deploy!

Railway will automatically:
1. ✅ Install dependencies
2. ✅ Run Prisma generate
3. ✅ Build Next.js app
4. ✅ Run database migrations
5. ✅ Start the server

### Step 7: Set Up Custom Domain (Optional)

1. Go to your app service → **Settings**
2. Under **Domains**, click **"Generate Domain"** for a free Railway subdomain
3. Or add your custom domain (doorcompliance.co.uk):
   - Click **"Custom Domain"**
   - Enter `doorcompliance.co.uk`
   - Add the DNS records shown to your domain provider
   - Add `www.doorcompliance.co.uk` as well

---

## Environment Variables Reference

### Essential Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your app's URL | `https://doorcompliance.co.uk` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | `your-random-32-char-string` |
| `NODE_ENV` | Environment | `production` |

### AWS S3 (Optional - for file uploads)

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region (e.g., `eu-west-2`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_S3_BUCKET_NAME` | S3 bucket name |

### Email (Optional - for notifications)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASSWORD` | Email password |
| `SMTP_FROM` | From email address |

---

## Post-Deployment Checklist

### 1. Verify Database Connection
```bash
# In Railway CLI or logs, check for:
✅ Database connected successfully
✅ Migrations applied
```

### 2. Create First Admin User

Use Railway's built-in shell:
1. Click on your service
2. Click **"Shell"** in the sidebar
3. Run:
```bash
npx ts-node scripts/create-admin.ts admin@example.com SecurePassword123 "Admin User" "Your Company"
```

### 3. Test the Application

1. Visit your Railway URL (e.g., `https://your-app.up.railway.app`)
2. Try logging in with the admin credentials
3. Test key features:
   - Building creation
   - Door registration
   - Inspection creation
   - PDF generation

### 4. Set Up Monitoring

Railway provides built-in monitoring:
- Click **"Metrics"** to view resource usage
- Check **"Logs"** for any errors
- Set up **"Alerts"** for downtime

---

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Solution: Check that nixpacks.toml includes:
npx prisma generate
```

**Error: Next.js build fails**
```bash
# Check Railway logs for specific error
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Missing dependencies
```

### Database Connection Issues

**Error: Can't reach database**
```bash
# Verify DATABASE_URL is set correctly
# Check that Railway PostgreSQL service is running
# Ensure DATABASE_URL references the Postgres service
```

### Migration Issues

**Error: Migrations failed**
```bash
# Option 1: Use db push instead (for initial deployment)
# Add to start command: npx prisma db push --accept-data-loss

# Option 2: Reset database (CAUTION: loses data)
# In Railway shell:
npx prisma migrate reset
```

---

## Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands in production
railway run npx prisma studio

# Set environment variables
railway variables set KEY=value
```

---

## Continuous Deployment

Once set up, Railway automatically deploys on every push to your main branch:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Railway automatically:
# 1. Detects the push
# 2. Builds the app
# 3. Runs migrations
# 4. Deploys new version
# 5. Zero-downtime deployment
```

---

## Performance Optimization

### 1. Enable Edge Caching

Add to `next.config.ts`:
```typescript
experimental: {
  serverActions: true,
},
```

### 2. Database Connection Pooling

Railway PostgreSQL includes connection pooling by default.

### 3. Monitor Resource Usage

- **RAM**: Next.js apps typically use 512MB-1GB
- **CPU**: Upgrade if experiencing slow responses
- **Database**: Monitor query performance in Railway metrics

---

## Scaling

Railway offers automatic scaling:

1. **Horizontal Scaling**
   - Add more instances in Service Settings
   - Load balancer included automatically

2. **Vertical Scaling**
   - Upgrade plan for more RAM/CPU
   - Database can scale independently

---

## Backup Strategy

### Automated Database Backups

Railway provides automatic backups:
- Daily snapshots
- 7-day retention
- One-click restore

### Manual Backup

```bash
# Export database
railway run npx prisma db pull

# Or use pg_dump via Railway shell
pg_dump $DATABASE_URL > backup.sql
```

---

## Cost Estimation

Railway Pricing (as of 2025):
- **Hobby Plan**: $5/month (includes $5 credit)
- **PostgreSQL**: Included in base plan
- **Bandwidth**: First 100GB free

Estimated monthly cost for your app:
- **Small scale** (< 1000 users): $5-10/month
- **Medium scale** (1000-10000 users): $20-50/month
- **Large scale** (10000+ users): $50-200/month

---

## Security Checklist

- [x] Environment variables secured
- [x] Database uses SSL
- [x] NEXTAUTH_SECRET is strong and unique
- [x] S3 bucket has proper IAM policies
- [ ] Set up Railway's built-in DDoS protection
- [ ] Enable Web Application Firewall (WAF) if needed
- [ ] Regular security updates via dependabot

---

## Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Quick Reference Commands

```bash
# View logs
railway logs

# Open app in browser
railway open

# SSH into service
railway shell

# Check service status
railway status

# Redeploy
railway up

# Environment variables
railway variables
```

---

## Next Steps After Deployment

1. ✅ Set up custom domain
2. ✅ Configure DNS records
3. ✅ Test all features
4. ✅ Create initial tenant accounts
5. ✅ Set up monitoring alerts
6. ✅ Configure backup schedule
7. ✅ Add Google Analytics
8. ✅ Submit sitemap to Google Search Console
9. ✅ Set up SSL certificate (automatic with Railway)
10. ✅ Configure CORS if needed for API access

---

Your application will be live at:
- **Railway URL**: `https://your-app.up.railway.app`
- **Custom Domain**: `https://doorcompliance.co.uk` (after DNS setup)

Deployment typically takes **3-5 minutes** from pushing code! 🚀
