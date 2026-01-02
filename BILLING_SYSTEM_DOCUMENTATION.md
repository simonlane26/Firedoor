# Billing System Documentation

## Overview

The Fire Door Inspector application now includes a comprehensive billing system that supports two distinct business models:

1. **Housing Associations**: Per-door or per-building pricing
2. **Fire Safety Contractors**: Per-inspector monthly licensing + per-door data storage

## Database Schema

### Tenant Model Extensions

Added billing configuration fields to the `Tenant` model:

```prisma
billingModel      String    @default("PER_DOOR")  // PER_DOOR, PER_BUILDING, PER_INSPECTOR
clientType        String    @default("HOUSING_ASSOCIATION")  // HOUSING_ASSOCIATION, CONTRACTOR
pricePerDoor      Float     @default(12.00)
pricePerInspector Float     @default(65.00)
pricePerBuilding  Float     @default(500.00)
billingCycle      String    @default("ANNUAL")  // MONTHLY, ANNUAL
nextBillingDate   DateTime?
stripeCustomerId  String?
stripeSubscriptionId String?
```

### New Models

#### Invoice Model
Stores generated invoices with line items, tax calculations, and payment tracking.

**Key Fields:**
- `invoiceNumber`: Unique invoice identifier
- `amount`, `subtotal`, `taxAmount`, `taxRate`: Financial details
- `status`: DRAFT, ISSUED, PAID, OVERDUE, CANCELLED
- `billingPeriodStart`, `billingPeriodEnd`: Billing period
- `items`: JSON array of line items
- Stripe integration fields

#### UsageRecord Model
Tracks monthly usage metrics for billing calculations.

**Key Fields:**
- `period`: Start of billing period (normalized to 1st of month)
- `doorCount`, `buildingCount`, `inspectorCount`, `inspectionCount`: Usage metrics
- `calculatedAmount`: Computed billing amount
- `usageDetails`: JSON breakdown of charges
- `invoiced`: Boolean flag for billing status

## Pricing Models

### Housing Association Pricing

#### Per-Door Model
- **Recommended Rate**: £8-15 per door per year
- **Default**: £12.00/door/year
- **Calculation**: `doorCount × pricePerDoor`
- **Use Case**: Ideal for organizations with consistent door counts

#### Per-Building Model
- **Recommended Rate**:
  - Small buildings: £300-800/year
  - Large buildings: £1,000-2,000/year
- **Default**: £500.00/building/year
- **Calculation**: `buildingCount × pricePerBuilding`
- **Use Case**: Best for portfolios with varying building sizes

### Fire Safety Contractor Pricing

- **Per-Inspector License**: £50-80 per inspector per month (default: £65)
- **Data Storage**: Per-door charge (default: £12/year, billed monthly)
- **Calculation**: `(inspectorCount × pricePerInspector) + (doorCount × pricePerDoor / 12)`
- **Use Case**: Contractors managing multiple client properties

## API Endpoints

### `/api/billing` (GET, PUT)

**GET** - Retrieve current billing configuration and usage
```typescript
Response: {
  billing: {
    billingModel, clientType, billingCycle,
    pricePerDoor, pricePerInspector, pricePerBuilding,
    nextBillingDate, stripeCustomerId, stripeSubscriptionId
  },
  usage: {
    doorCount, buildingCount, inspectorCount, inspectionCount
  },
  costs: {
    estimatedMonthlyCost, estimatedAnnualCost
  },
  recentInvoices: Invoice[],
  currentUsageRecord: UsageRecord | null
}
```

**PUT** - Update billing settings (Admin only)
```typescript
Body: {
  billingModel: string,
  clientType: string,
  pricePerDoor: number,
  pricePerInspector: number,
  pricePerBuilding: number,
  billingCycle: string
}
```

### `/api/invoices` (GET, POST)

**GET** - Retrieve all invoices for the tenant
```typescript
Response: Invoice[]
```

**POST** - Generate new invoice (Admin only)
```typescript
Body: {
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  dueInDays?: number  // Default: 30
}
Response: Invoice
```

### `/api/usage/track` (GET, POST)

**POST** - Track usage for current tenant
```typescript
Body: {
  period?: Date  // Default: current date
}
Response: UsageRecord
```

**GET** - Track usage for all tenants (Admin only, for cron jobs)
```typescript
Response: {
  success: true,
  tracked: number,
  failed: number,
  results: Array<{ tenantId, success, usageRecord? }>
}
```

## Utility Functions

### Usage Tracking (`lib/usage-tracking.ts`)

#### `createOrUpdateUsageRecord({ tenantId, period })`
Creates or updates a usage record for a specific period. Automatically:
- Normalizes period to start of month
- Counts doors, buildings, inspectors, inspections
- Calculates charges based on billing model
- Creates detailed usage breakdown

#### `getUnbilledUsageRecords(tenantId)`
Retrieves all usage records not yet invoiced.

#### `markUsageRecordsAsInvoiced(usageRecordIds, invoiceId)`
Marks usage records as invoiced.

#### `trackMonthlyUsageForAllTenants()`
Processes usage tracking for all tenants. Use for scheduled jobs.

### Invoice Generation (`lib/invoice-generator.ts`)

#### `generateInvoice({ tenantId, billingPeriodStart, billingPeriodEnd, dueInDays })`
Generates an invoice from unbilled usage records:
1. Retrieves unbilled usage records for period
2. Calculates subtotal, tax (20% VAT), and total
3. Generates unique invoice number (format: `INV-{SUBDOMAIN}-{NUMBER}`)
4. Creates line items with detailed breakdown
5. Marks usage records as invoiced

#### `markInvoiceAsPaid(invoiceId, paidDate?)`
Updates invoice status to PAID.

#### `checkOverdueInvoices()`
Scans for overdue invoices and updates status. Returns count of overdue invoices.

## User Interface

### Billing Dashboard (`/settings/billing`)

**Features:**
1. **Overview Cards**
   - Estimated monthly and annual costs
   - Current billing model and cycle
   - Client type

2. **Current Usage Display**
   - Fire doors count
   - Buildings count
   - Inspectors count
   - Inspections this month

3. **Billing Settings (Admin Only)**
   - Client type selector (Housing Association / Contractor)
   - Billing model selector (context-sensitive based on client type)
   - Billing cycle (Monthly / Annual)
   - Price configuration with recommended ranges

4. **Recent Invoices**
   - Invoice number, issue date, due date
   - Amount and status badges
   - Color-coded status (Paid, Issued, Overdue)

5. **Pricing Information**
   - Contextual explanation of current pricing structure
   - Estimated costs based on usage

## Usage Workflow

### For Housing Associations

1. **Setup**: Admin configures billing settings
   - Select "Housing Association" as client type
   - Choose "Per Door" or "Per Building" model
   - Set pricing (£8-15/door or £300-2,000/building)
   - Choose billing cycle (Monthly or Annual)

2. **Automatic Tracking**: System tracks usage automatically
   - Door and building counts updated in real-time
   - Monthly usage records created

3. **Billing**: Admin generates invoices
   - Select billing period
   - System calculates charges automatically
   - Invoice generated with 20% VAT

### For Fire Safety Contractors

1. **Setup**: Admin configures billing settings
   - Select "Fire Safety Contractor" as client type
   - Billing model automatically set to "Per Inspector + Per Door"
   - Set inspector license price (£50-80/month)
   - Set door data storage price (£8-15/year)

2. **Automatic Tracking**: System tracks usage
   - Inspector count (users with INSPECTOR role)
   - Door count across all client properties
   - Monthly usage records created

3. **Billing**: Monthly invoicing
   - Inspector licenses billed monthly
   - Door storage billed monthly (annual price ÷ 12)
   - Combined into single invoice

## Automation Opportunities

### Recommended Cron Jobs

1. **Daily Usage Tracking** (runs at midnight)
   ```
   GET /api/usage/track
   ```
   Updates usage metrics for all tenants

2. **Weekly Overdue Check** (runs Monday mornings)
   ```javascript
   import { checkOverdueInvoices } from '@/lib/invoice-generator'
   await checkOverdueInvoices()
   ```
   Marks overdue invoices and triggers notifications

3. **Monthly Invoice Generation** (runs 1st of month)
   ```javascript
   import { generateInvoice } from '@/lib/invoice-generator'
   // Generate invoices for previous month
   ```

## Integration with Stripe (Future Enhancement)

The system is prepared for Stripe integration with:
- `stripeCustomerId` on Tenant model
- `stripeSubscriptionId` on Tenant model
- `stripeInvoiceId` and `stripePaymentIntentId` on Invoice model

### Suggested Implementation:
1. Create Stripe customer on tenant creation
2. Create Stripe subscription based on billing model
3. Use webhooks to update invoice status on payment
4. Implement automatic payment collection

## Tax Compliance

- **Default VAT Rate**: 20%
- **Invoice Fields**: All UK invoice requirements included
- **Invoice Numbering**: Sequential per tenant
- **Date Tracking**: Issue date, due date, paid date

## Reporting

The billing dashboard provides:
- Real-time usage metrics
- Cost estimates
- Invoice history
- Compliance with pricing agreements

## Navigation

Billing page accessible from:
- Dashboard → "Billing" button (top navigation)
- Direct URL: `/settings/billing`

## Security

- Admin-only access for:
  - Billing settings modification
  - Invoice generation
  - Price changes
- User-level access for:
  - Viewing usage and costs
  - Viewing invoices
- Multi-tenant isolation enforced

## Best Practices

1. **Regular Usage Tracking**: Run daily to ensure accurate billing
2. **Review Before Invoicing**: Check usage records before generating invoices
3. **Pricing Updates**: Update prices at renewal periods, not mid-cycle
4. **Archive Old Invoices**: Keep records for 6+ years (UK requirement)
5. **Monitor Overdue**: Weekly checks for payment collection

## Support for Multiple Pricing Tiers

The system supports:
- Different pricing per tenant
- Flexible billing cycles
- Custom pricing configurations
- Volume-based pricing adjustments

## Future Enhancements

1. **Automatic Payment Processing** via Stripe
2. **Email Invoice Delivery** with PDF attachments
3. **Payment Reminders** for overdue invoices
4. **Billing Analytics Dashboard** with trends
5. **Multi-currency Support** for international clients
6. **Credit Notes** for refunds and adjustments
7. **Subscription Pausing** for seasonal contracts
8. **Volume Discounts** based on usage tiers
