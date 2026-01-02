# Fire Door Inspector - Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### Code & Dependencies
- [ ] All dependencies installed: `npm install`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Code builds successfully: `npm run build`
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (or warnings addressed)

### Database
- [ ] Production database created (PostgreSQL)
- [ ] Database URL configured in environment variables
- [ ] Database migrations run: `npm run db:migrate`
- [ ] Database backed up (if existing data)
- [ ] Database connection tested

### Environment Variables
- [ ] `.env` file created for production
- [ ] `DATABASE_URL` set to production database
- [ ] `NEXTAUTH_SECRET` generated (32+ character random string)
- [ ] `NEXTAUTH_URL` set to production domain (https://yourdomain.com)
- [ ] `NODE_ENV` set to "production"
- [ ] All secrets are secure (not committed to Git)

### Security
- [ ] Strong `NEXTAUTH_SECRET` (not default/example value)
- [ ] Database credentials are secure
- [ ] `.env` file is in `.gitignore`
- [ ] SSL/TLS certificate configured (HTTPS)
- [ ] Database access restricted (firewall/security groups)
- [ ] No sensitive data in code or logs

### Users & Access
- [ ] Admin user created in production database
- [ ] Admin password is strong and secure
- [ ] Test login successful
- [ ] Other user accounts created (if needed)

## Deployment Steps

### Option A: Vercel (Recommended)

1. **Connect Repository**
   - [ ] GitHub/GitLab repo connected to Vercel
   - [ ] Automatic deployments configured

2. **Environment Variables**
   - [ ] All environment variables added in Vercel dashboard
   - [ ] `DATABASE_URL` configured
   - [ ] `NEXTAUTH_SECRET` configured
   - [ ] `NEXTAUTH_URL` set to Vercel domain

3. **Database**
   - [ ] PostgreSQL database provisioned (Vercel Postgres or external)
   - [ ] Database URL added to environment variables
   - [ ] Migrations run: `npx prisma migrate deploy`

4. **Deploy**
   - [ ] Trigger deployment
   - [ ] Build successful
   - [ ] Visit production URL
   - [ ] Test login

### Option B: Railway

1. **Create Project**
   - [ ] New project created on Railway
   - [ ] GitHub repo connected

2. **Add PostgreSQL**
   - [ ] PostgreSQL service added
   - [ ] Database URL copied

3. **Environment Variables**
   - [ ] `DATABASE_URL` set (from PostgreSQL service)
   - [ ] `NEXTAUTH_SECRET` set
   - [ ] `NEXTAUTH_URL` set to Railway domain

4. **Deploy**
   - [ ] Service deployed
   - [ ] Build successful
   - [ ] Migrations run in terminal
   - [ ] Test application

### Option C: Self-Hosted (VPS)

1. **Server Setup**
   - [ ] VPS provisioned (DigitalOcean, Linode, AWS EC2, etc.)
   - [ ] Ubuntu/Debian installed
   - [ ] SSH access configured
   - [ ] Firewall configured (ports 80, 443, 22)

2. **Install Dependencies**
   ```bash
   # Node.js
   - [ ] Node.js 18+ installed

   # PostgreSQL
   - [ ] PostgreSQL installed
   - [ ] Database created

   # PM2 (Process Manager)
   - [ ] PM2 installed globally

   # Nginx (Reverse Proxy)
   - [ ] Nginx installed
   - [ ] SSL certificate configured (Let's Encrypt)
   ```

3. **Deploy Application**
   ```bash
   - [ ] Code cloned to server
   - [ ] Dependencies installed: npm install
   - [ ] Environment variables configured
   - [ ] Build completed: npm run build
   - [ ] Migrations run: npx prisma migrate deploy
   - [ ] PM2 process started
   - [ ] Nginx configured
   - [ ] Domain DNS pointed to server
   ```

## Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] Can log in with admin credentials
- [ ] Dashboard loads with correct data
- [ ] Can add a building
- [ ] Can register a fire door
- [ ] Can create an inspection
- [ ] Inspection result calculates correctly
- [ ] Access denial workflow works
- [ ] All navigation links work

### Security Tests
- [ ] HTTPS working (padlock in browser)
- [ ] HTTP redirects to HTTPS
- [ ] Login required for protected pages
- [ ] Unauthorized access blocked
- [ ] Session persists correctly
- [ ] Logout works

### Performance Tests
- [ ] Pages load quickly (< 2 seconds)
- [ ] Database queries are fast
- [ ] No console errors
- [ ] Images/assets load correctly
- [ ] Mobile responsive

### Database Tests
- [ ] Can create records
- [ ] Can read records
- [ ] Can update records
- [ ] Relationships work correctly
- [ ] Cascade deletes work (test on test data)

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Vercel Analytics, Google Analytics)
- [ ] Database monitoring
- [ ] Disk space monitoring

### Backups
- [ ] Automated database backups configured
- [ ] Backup restoration tested
- [ ] Backup schedule documented
- [ ] Backup retention policy set

### Documentation
- [ ] Production URL documented
- [ ] Admin credentials stored securely (password manager)
- [ ] Database connection details documented
- [ ] Environment variables documented
- [ ] Deployment process documented

## Ongoing Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor application uptime

### Weekly
- [ ] Review user feedback
- [ ] Check database performance
- [ ] Monitor disk space

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Apply security patches
- [ ] Review security audit: `npm audit`
- [ ] Test backup restoration
- [ ] Review access logs

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] User training sessions
- [ ] Feature requests review

## Rollback Plan

In case of issues:

1. **Vercel/Railway**
   - [ ] Revert to previous deployment in dashboard
   - [ ] Check environment variables unchanged
   - [ ] Verify database not affected

2. **Self-Hosted**
   - [ ] Stop PM2 process
   - [ ] Restore previous code version
   - [ ] Restore database from backup (if needed)
   - [ ] Restart application

## Support & Escalation

### Level 1 (User Issues)
- [ ] Support email configured
- [ ] FAQ/Help documentation available
- [ ] User training materials prepared

### Level 2 (Technical Issues)
- [ ] Technical contact identified
- [ ] Access to logs and monitoring
- [ ] Issue tracking system set up

### Level 3 (Critical Issues)
- [ ] Emergency contact list
- [ ] Database admin access
- [ ] Backup restoration procedures
- [ ] Incident response plan

## Compliance & Legal

- [ ] Privacy policy reviewed
- [ ] Data protection compliance (GDPR if applicable)
- [ ] Terms of service prepared
- [ ] User consent mechanisms in place
- [ ] Data retention policy documented
- [ ] Right to deletion process implemented

## Training & Onboarding

- [ ] Admin user guide prepared
- [ ] Inspector training materials ready
- [ ] Video tutorials created (optional)
- [ ] Support documentation published
- [ ] Initial user training scheduled

## Launch Communication

- [ ] Users notified of launch
- [ ] Training sessions scheduled
- [ ] Support channels communicated
- [ ] Feedback mechanism in place

## Success Criteria

Define what success looks like:

- [ ] All users can log in
- [ ] At least one building registered
- [ ] At least one inspection completed
- [ ] No critical errors in first 48 hours
- [ ] User feedback collected
- [ ] Compliance requirements met

---

## Final Checks

- [ ] All items above completed
- [ ] Production URL accessible
- [ ] All stakeholders notified
- [ ] Support team ready
- [ ] Celebration scheduled! 🎉

**Deployment Date:** _________________

**Deployed By:** _________________

**Notes:**
_________________________________
_________________________________
_________________________________

---

**Your Fire Door Inspector app is ready for production! 🔥🚪**
