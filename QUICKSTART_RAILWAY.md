# Railway Deployment - Quick Start (5 Minutes)

## What You Need

1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Your code pushed to GitHub

## 5-Minute Deployment

### Step 1: Push to GitHub (2 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Railway (3 min)

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your `fire-door-inspector` repository
4. Click **"Add PostgreSQL"**
5. Click **"Deploy"**

### Step 3: Add Environment Variables

In Railway, go to your app → **Variables** → Add these:

```bash
NEXTAUTH_SECRET=     # Run: openssl rand -base64 32
NEXTAUTH_URL=        # Your Railway URL (copy from dashboard)
NODE_ENV=production
```

**That's it!** Your app is live! 🎉

---

## Access Your App

1. Click **"View Logs"** to watch deployment
2. When ready, click **"Open App"**
3. Your app is at: `https://your-app.up.railway.app`

---

## Create Your First Admin User

1. In Railway, click your service → **"Shell"**
2. Run:
```bash
npx ts-node scripts/create-admin.ts admin@example.com MyPassword123 "Admin" "MyCompany"
```

3. Log in at your Railway URL!

---

## Add Custom Domain (Optional)

1. In Railway, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `doorcompliance.co.uk`
4. Add the DNS records shown to your domain provider
5. Wait 5-10 minutes for DNS to propagate

---

## Common Issues & Fixes

**"Build failed"**
- Check Railway logs for errors
- Ensure DATABASE_URL is linked to Postgres

**"Can't connect to database"**
- Click Variables → Add Reference → Select Postgres → DATABASE_URL

**"App crashes on start"**
- Check all environment variables are set
- View logs for specific error

---

## Next Steps

- ✅ Set up custom domain
- ✅ Configure email (SMTP)
- ✅ Set up S3 for file uploads
- ✅ Add monitoring alerts
- ✅ Submit to Google Search Console

---

## Support

- **Detailed Guide**: See `RAILWAY_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway

---

**Deployment time**: ~5 minutes
**Cost**: $5/month (includes $5 credit)

Your fire door inspection app will be live and accessible worldwide! 🚀
