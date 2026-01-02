# Super Admin System Guide

## Overview

The super-admin system provides you (the system owner) with privileged access to manage all tenant billing and subscriptions across the platform. This separates your administrative capabilities from regular tenant admins.

## Access Levels

### 1. Super Admin (You)
- **Access**: Manage ALL tenants' billing settings
- **Capabilities**:
  - View all tenants and their usage
  - Edit billing models and pricing for any tenant
  - Generate invoices for any tenant
  - View revenue analytics across all tenants
  - Manage subscription status (Active/Trial/Suspended/Cancelled)

### 2. Tenant Admin
- **Access**: View their own tenant's billing only
- **Capabilities**:
  - View subscription plan and usage
  - View invoices
  - **Cannot** edit pricing or billing settings
  - Read-only access to billing page

### 3. Regular Users (Manager/Inspector)
- **Access**: View basic usage stats
- **Capabilities**:
  - See door, building, and inspection counts
  - View estimated costs
  - **Cannot** access billing settings

## Setting Up Super Admin

### Step 1: Make Yourself a Super Admin

Run this command with your email address:

```bash
npx tsx scripts/set-super-admin.ts your-email@example.com
```

You'll see confirmation:
```
✅ User your-email@example.com is now a super admin
User ID: xxx
Name: Your Name
Role: ADMIN
```

### Step 2: Log Out and Log Back In

The `isSuperAdmin` flag is stored in your session. You need to:
1. Log out of the application
2. Log back in
3. You'll now see a purple "SUPER ADMIN" badge next to your name

## Using the Super Admin Panel

### Accessing the Panel

Once logged in as super admin, you'll see a **"Tenant Management"** button in the dashboard header. Click it to access the super admin panel at `/admin/tenants`.

### What You'll See

#### Revenue Overview Cards
- **Total Tenants**: Count of all customer accounts
- **Monthly Revenue**: Sum of all tenant monthly costs
- **Annual Revenue**: Sum of all tenant annual costs
- **Total Doors**: Doors managed across all tenants

#### Tenants Table
Displays all tenants with:
- Company name and subdomain
- Client type (Housing Association / Contractor)
- Billing model (Per Door / Per Building / Per Inspector)
- Current usage (doors, buildings, inspectors)
- Estimated monthly and annual costs
- Subscription status
- Edit button for each tenant

### Editing a Tenant's Billing

1. Click the **Settings** icon (⚙️) next to any tenant
2. Edit dialog opens with:
   - **Client Type**: Housing Association or Fire Safety Contractor
   - **Billing Model**: Changes based on client type
   - **Billing Cycle**: Monthly or Annual
   - **Subscription Status**: Active, Trial, Suspended, or Cancelled
   - **Pricing**:
     - Price per door (£/year)
     - Price per inspector (£/month)
     - Price per building (£/year)
3. Click **Save Changes**
4. Changes apply immediately

### Typical Pricing Configurations

#### Housing Association - Per Door
```
Client Type: Housing Association
Billing Model: Per Door
Price Per Door: £8.00 - £15.00/year
Billing Cycle: Annual
```

#### Housing Association - Per Building
```
Client Type: Housing Association
Billing Model: Per Building
Price Per Building:
  - Small: £300 - £800/year
  - Large: £1,000 - £2,000/year
Billing Cycle: Annual
```

#### Fire Safety Contractor
```
Client Type: Fire Safety Contractor
Billing Model: Per Inspector + Per Door
Price Per Inspector: £50 - £80/month
Price Per Door: £12/year (billed monthly: £1/door/month)
Billing Cycle: Monthly
```

## Billing Page Access Control

### For Super Admins (You)
When you visit `/settings/billing`:
- **Full edit access** to billing settings
- "Edit Settings" button visible
- Can change all pricing and configurations
- Description: "Manage tenant subscription plan and view usage"

### For Tenant Admins
When they visit `/settings/billing`:
- **Read-only access**
- No "Edit Settings" button
- Can view usage, costs, and invoices
- Description: "View your subscription plan and usage"
- Cannot modify any settings

### API Endpoint Protection
All billing modification endpoints require `isSuperAdmin === true`:
- `PUT /api/billing` - Update billing settings
- `PUT /api/admin/tenants/:id` - Update tenant billing
- `POST /api/invoices` - Generate invoices

## Managing Multiple Tenants

### Onboarding a New Customer

1. Create the tenant account (existing tenant creation process)
2. Go to **Tenant Management** (`/admin/tenants`)
3. Find the new tenant in the list
4. Click **Edit** (⚙️ icon)
5. Configure:
   - Select client type (Housing Association or Contractor)
   - Choose billing model
   - Set pricing based on contract
   - Set billing cycle
   - Set status to "Trial" or "Active"
6. Save

### Changing a Customer's Plan

Use cases:
- **Contract renewal**: Update pricing to new rates
- **Upgrade/downgrade**: Change from per-door to per-building
- **Client type change**: Switch between Housing and Contractor
- **Trial to paid**: Change status from Trial to Active

Steps:
1. Go to Tenant Management
2. Click Edit on the tenant
3. Update the relevant fields
4. Save (costs recalculate automatically)

### Suspending or Cancelling a Subscription

To suspend a non-paying customer:
1. Edit tenant
2. Set **Subscription Status** to "Suspended"
3. Save

To cancel:
1. Edit tenant
2. Set **Subscription Status** to "Cancelled"
3. Save

## Revenue Analytics

The Tenant Management dashboard provides real-time revenue analytics:

### Monthly Revenue
Sum of all active tenants' monthly costs. Calculated as:
- Housing (Per Door): `(doors × price) / 12`
- Housing (Per Building): `(buildings × price) / 12`
- Contractor: `(inspectors × price) + (doors × price / 12)`

### Annual Revenue
Sum of all active tenants' annual costs. Calculated as:
- Housing: Direct multiplication of units × price
- Contractor: Monthly × 12

## Invoice Generation

Currently, invoices can be generated via API. Future enhancement will add invoice generation UI to the Tenant Management panel.

To generate an invoice for a tenant (via API):
```bash
POST /api/invoices
{
  "billingPeriodStart": "2025-01-01",
  "billingPeriodEnd": "2025-01-31",
  "dueInDays": 30
}
```

## Security Notes

- **isSuperAdmin** is a database flag, not just a session variable
- Super admin status is checked on both frontend and backend
- Cannot be escalated by regular users
- Only you (or other super admins) can grant super admin status
- Use the script to add additional super admins if needed

## Best Practices

1. **Review tenant usage monthly** - Check the Tenant Management dashboard
2. **Update pricing at renewal** - Don't change mid-cycle unless agreed
3. **Use Trial status for new customers** - Convert to Active after onboarding
4. **Monitor revenue trends** - Watch monthly/annual revenue totals
5. **Document pricing changes** - Keep records of why pricing was adjusted
6. **Suspend before cancelling** - Give customers a chance to resolve payment issues

## Future Enhancements

Planned features for super admin panel:
- Invoice generation UI with PDF download
- Revenue charts and trends
- Tenant activity logs
- Bulk pricing updates
- Payment status tracking
- Email notifications for overdue invoices
- Customer communication tools

## Support

If you need to:
- Add another super admin: Run the script with their email
- Remove super admin: Manually update database `isSuperAdmin = false`
- Debug access issues: Check session, database flag, and API logs
