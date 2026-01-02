# Fire Door Inspector - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- PostgreSQL running (or Docker)

### Setup Steps

1. **Install dependencies**
```bash
npm install
```

2. **Create `.env` file**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fire_door_inspector"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up database**
```bash
npm run db:migrate
```

4. **Create admin user**
```bash
npm run db:studio
```
- Open Prisma Studio
- Add User record with hashed password (see below)

5. **Start app**
```bash
npm run dev
```

Visit: http://localhost:3000

## 🔐 Create Password Hash

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

## 📋 Inspection Quick Reference

### Flat Entrance Doors → 12-month cycle
- Visual damage check ✓
- Closes completely ✓
- Self-closer works ✓
- Gaps ≤ 4mm ✓
- Hinges secure ✓
- Intumescent strips intact ✓
- Letterbox closes ✓

### Communal Doors (Building > 11m) → 3-month cycle
- All above checks ✓
- Plus: Air transfer grille (if plant room) ✓

## 🎯 Pass/Fail Logic

**FAIL** if:
- Won't close completely
- Self-closer broken
- Gaps > 4mm
- Intumescent strips damaged
- Major structural damage

**REQUIRES ATTENTION** if:
- Smoke seal damaged
- Letterbox issue
- Minor problems

**PASS** if:
- All checks passed

## 📊 Quick Commands

```bash
npm run dev          # Start development
npm run build        # Build for production
npm run start        # Start production
npm run db:studio    # Open database GUI
npm run db:migrate   # Run migrations
```

## 🏢 First Use Workflow

1. Login → Dashboard
2. Add Building (name, address, height)
3. Register Fire Doors (door number, location, type)
4. Start Inspection (select door, complete checklist)
5. View Results on Dashboard

## 🆘 Troubleshooting

**Can't login?**
- Check user exists in database
- Verify password hash is correct

**Database error?**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`

**Build errors?**
- Run: `npm install`
- Then: `npm run db:generate`

## 📚 More Help

- Full documentation: [README.md](README.md)
- Setup guide: [SETUP.md](SETUP.md)
- Compliance info: [COMPLIANCE.md](COMPLIANCE.md)
- Project details: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Ready to inspect! 🔥🚪**
