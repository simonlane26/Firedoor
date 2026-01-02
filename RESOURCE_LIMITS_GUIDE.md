# Resource Limits System Guide

## Overview

The resource limits system allows you to control how many doors, buildings, users, and inspectors each tenant can create. This prevents abuse, manages database growth, and enables tiered pricing plans.

## How It Works

### Automatic Enforcement

When a tenant tries to create a resource (door, building, user, inspector), the system:
1. Checks their current usage against their limit
2. **Blocks creation** if they're at or over the limit
3. Returns a clear error message telling them to upgrade
4. Shows warnings when they're approaching limits (80%+)

### Limit Types

#### Per Tenant
- **Max Doors**: Maximum fire doors they can manage
- **Max Buildings**: Maximum buildings they can manage
- **Max Users**: Maximum total users (all roles)
- **Max Inspectors**: Maximum users with INSPECTOR role

### Default Limits

When you create a new tenant, they get these defaults:
- **Max Doors**: 1,000
- **Max Buildings**: 50
- **Max Users**: 10
- **Max Inspectors**: 5

You can adjust these for each tenant in the super admin panel.

## Super Admin Management

### Setting Limits for a Tenant

1. Go to **Tenant Management** (`/admin/tenants`)
2. Click the **Settings** icon (⚙️) next to the tenant
3. Scroll to **Resource Limits** section
4. See current usage vs. limits:
   - Max Doors (Current: X)
   - Max Buildings (Current: Y)
   - Max Users (Current: Z)
   - Max Inspectors (Current: W)
5. Adjust limits as needed
6. Click **Save Changes**

### Common Scenarios

#### Upgrading a Customer
Customer wants to add more doors:
1. Edit their tenant
2. Increase **Max Doors** from 1,000 to 2,000
3. Save

Customer upgraded to enterprise plan:
1. Edit their tenant
2. Set all limits much higher:
   - Max Doors: 10,000
   - Max Buildings: 500
   - Max Users: 100
   - Max Inspectors: 50
3. Save

#### Downgrading a Customer
Customer downgrades but currently using 1,500 doors with new limit of 1,000:
- **System allows this** but they can't add new doors until they're under 1,000
- They must delete 500 doors before adding new ones
- Existing doors continue to work normally

## API Enforcement

### Protected Endpoints

These endpoints check limits before creation:

#### POST /api/doors
- Checks: `maxDoors`
- Error (403): "You have reached your door limit of X"

#### POST /api/buildings
- Checks: `maxBuildings`
- Error (403): "You have reached your building limit of X"

#### POST /api/users
- Checks: `maxUsers`
- Also checks `maxInspectors` if role is INSPECTOR
- Error (403): "You have reached your user/inspector limit of X"

### Error Response Format
```json
{
  "error": "Door limit reached",
  "message": "You have reached your door limit of 1000. Please contact support to upgrade your plan.",
  "current": 1000,
  "limit": 1000
}
```

## User Experience

### Warning Banners

Users see automatic warnings on their dashboard when approaching limits:

#### Near Limit Warning (80%+)
Orange banner appears:
> **Approaching Doors Limit**
> You are approaching your doors limit (850/1000, 150 remaining). Consider upgrading your plan.

#### At Limit Warning (100%)
Red banner appears:
> **Doors Limit Reached**
> You have reached your doors limit (1000/1000). You cannot add more doors until you upgrade your plan.
> **Contact support to upgrade your plan.**

### When Creating Resources

If they try to create a door at limit:
1. Form submits
2. API returns 403 error
3. User sees error message: "You have reached your door limit of 1,000. Please contact support to upgrade your plan."
4. Door is NOT created

## Checking Limits Programmatically

### Get Current Limits

```typescript
GET /api/limits

Response:
{
  "doors": {
    "current": 850,
    "limit": 1000,
    "percentage": 85,
    "remaining": 150,
    "isNearLimit": true,
    "isAtLimit": false
  },
  "buildings": {
    "current": 30,
    "limit": 50,
    "percentage": 60,
    "remaining": 20,
    "isNearLimit": false,
    "isAtLimit": false
  },
  "users": {
    "current": 8,
    "limit": 10,
    "percentage": 80,
    "remaining": 2,
    "isNearLimit": true,
    "isAtLimit": false
  },
  "inspectors": {
    "current": 3,
    "limit": 5,
    "percentage": 60,
    "remaining": 2,
    "isNearLimit": false,
    "isAtLimit": false
  }
}
```

## Database Implementation

### Schema

```prisma
model Tenant {
  // ... other fields ...

  maxDoors          Int       @default(1000)
  maxBuildings      Int       @default(50)
  maxUsers          Int       @default(10)
  maxInspectors     Int       @default(5)
}
```

### Enforcement Functions

Located in `lib/limits.ts`:

- `checkDoorLimit(tenantId)` - Throws if at limit
- `checkBuildingLimit(tenantId)` - Throws if at limit
- `checkUserLimit(tenantId)` - Throws if at limit
- `checkInspectorLimit(tenantId)` - Throws if at limit
- `getTenantLimits(tenantId)` - Returns usage info

## Railway PostgreSQL Considerations

### Database vs. Application Limits

**Important distinction:**

1. **Railway Database Limits** (Hobby: 512 MB, Pro: 8 GB)
   - Total storage across ALL tenants
   - Managed by Railway
   - You monitor in Railway dashboard

2. **Application Resource Limits** (This system)
   - Per-tenant limits on resources
   - Managed by you in super admin panel
   - Controls individual customer usage

### Why Both Matter

- **Railway limit**: Protects your database from running out of space
- **App limits**: Controls per-customer usage and enables tiered pricing

### Monitoring

**Railway Dashboard:**
- Check total database size
- Get alerts when approaching limits
- Upgrade plan if needed

**Your Admin Panel:**
- See per-tenant usage
- Adjust limits per customer
- Total usage across all tenants

## Pricing Strategy Integration

### Housing Associations

#### Per-Door Pricing (£8-15/year)
- Set `maxDoors` based on their plan
- Small: 1,000 doors
- Medium: 5,000 doors
- Large: 10,000 doors

#### Per-Building Pricing (£300-2,000/year)
- Set `maxBuildings` based on their plan
- Small: 50 buildings
- Medium: 200 buildings
- Large: 1,000 buildings

### Fire Safety Contractors

#### Per-Inspector + Per-Door
- `maxInspectors`: Based on their subscription tier
- `maxDoors`: Based on client portfolio size
- Example tiers:
  - Starter: 5 inspectors, 2,000 doors
  - Professional: 20 inspectors, 10,000 doors
  - Enterprise: Unlimited

## Best Practices

### 1. Set Appropriate Defaults
- Don't set limits too low for new customers
- Allow room for growth without constant upgrades
- Default to 1,000 doors is reasonable for most

### 2. Warn Before Blocking
- 80% threshold gives advance warning
- Customers can plan upgrades proactively
- Reduces support tickets

### 3. Allow Over-Limit Downgrade
- Don't force deletion of existing data
- Just prevent new creations until under limit
- Gives customers time to decide

### 4. Monitor Aggregate Usage
- Watch total usage across all tenants
- Ensure you're not hitting Railway limits
- Scale database before it's critical

### 5. Document Limits in Plans
- Make limits clear in pricing tiers
- Show limits in customer dashboard
- Transparent = fewer complaints

## Troubleshooting

### Customer Can't Add Doors

**Check:**
1. What's their `maxDoors` limit?
2. What's their current door count?
3. Are they at/over limit?

**Fix:**
1. If legitimate need: Increase their limit
2. If they should upgrade: Direct to sales
3. If hit limit accidentally: Help them delete unused doors

### Limits Not Enforcing

**Check:**
1. Did Prisma migration run? (`npx prisma db push`)
2. Is Prisma client regenerated? (`npx prisma generate`)
3. Are limit fields in database?

**Fix:**
```bash
npx prisma db push
rm -rf node_modules/.prisma
npx prisma generate
```

### Warning Banner Not Showing

**Check:**
1. Is `/api/limits` endpoint working?
2. Check browser console for errors
3. Is LimitWarningBanner component mounted?

**Debug:**
```bash
curl http://localhost:3000/api/limits
# Should return limit data
```

## Future Enhancements

Potential additions:
- **Usage quotas**: Limit inspections per month
- **Storage limits**: Limit file uploads per tenant
- **API rate limiting**: Requests per minute
- **Auto-upgrade prompts**: One-click upgrade flow
- **Limit history**: Track limit changes over time
- **Usage analytics**: Show trends approaching limits
- **Custom limit rules**: Different limits for different resources

## Summary

The resource limits system gives you:
- ✅ Control over per-tenant resource usage
- ✅ Protection against database abuse
- ✅ Foundation for tiered pricing
- ✅ Automatic enforcement at API level
- ✅ User-friendly warnings and messages
- ✅ Super admin tools for management

This works independently of Railway's database limits, giving you fine-grained control over each customer's usage while Railway protects your overall database capacity.
