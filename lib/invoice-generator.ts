import { prisma } from './prisma'
import { getUnbilledUsageRecords, markUsageRecordsAsInvoiced } from './usage-tracking'

interface GenerateInvoiceParams {
  tenantId: string
  billingPeriodStart: Date
  billingPeriodEnd: Date
  dueInDays?: number
}

export async function generateInvoice({
  tenantId,
  billingPeriodStart,
  billingPeriodEnd,
  dueInDays = 30
}: GenerateInvoiceParams) {
  try {
    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    // Get unbilled usage records for the period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenantId,
        period: {
          gte: billingPeriodStart,
          lte: billingPeriodEnd
        },
        invoiced: false
      },
      orderBy: { period: 'asc' }
    })

    if (usageRecords.length === 0) {
      throw new Error('No unbilled usage records found for the period')
    }

    // Calculate total
    const subtotal = usageRecords.reduce((sum, record) => sum + record.calculatedAmount, 0)
    const taxRate = 0.20 // 20% VAT
    const taxAmount = subtotal * taxRate
    const amount = subtotal + taxAmount

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { tenantId }
    })
    const invoiceNumber = `INV-${tenant.subdomain.toUpperCase()}-${String(invoiceCount + 1).padStart(5, '0')}`

    // Create line items
    const items = usageRecords.map((record) => {
      const details = record.usageDetails ? JSON.parse(record.usageDetails) : {}
      const periodStr = new Date(record.period).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

      return {
        period: periodStr,
        description: generateLineItemDescription(tenant, record, details),
        quantity: getQuantity(tenant, record),
        unitPrice: getUnitPrice(tenant),
        amount: record.calculatedAmount,
        details
      }
    })

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueInDays)

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        tenantId,
        amount,
        subtotal,
        taxAmount,
        taxRate,
        status: 'ISSUED',
        billingPeriodStart,
        billingPeriodEnd,
        issueDate: new Date(),
        dueDate,
        items: JSON.stringify(items)
      }
    })

    // Mark usage records as invoiced
    await markUsageRecordsAsInvoiced(
      usageRecords.map((r) => r.id),
      invoice.id
    )

    return invoice
  } catch (error) {
    console.error('Error generating invoice:', error)
    throw error
  }
}

function generateLineItemDescription(tenant: any, record: any, details: any): string {
  if (tenant.clientType === 'HOUSING_ASSOCIATION') {
    if (tenant.billingModel === 'PER_DOOR') {
      return `Fire Door Management - ${record.doorCount} doors`
    } else if (tenant.billingModel === 'PER_BUILDING') {
      return `Building Fire Safety Management - ${record.buildingCount} buildings`
    }
  } else if (tenant.clientType === 'CONTRACTOR') {
    return `Inspector Licenses (${record.inspectorCount}) + Door Data Storage (${record.doorCount} doors)`
  }
  return 'Fire Safety Management Services'
}

function getQuantity(tenant: any, record: any): number {
  if (tenant.clientType === 'HOUSING_ASSOCIATION') {
    if (tenant.billingModel === 'PER_DOOR') {
      return record.doorCount
    } else if (tenant.billingModel === 'PER_BUILDING') {
      return record.buildingCount
    }
  } else if (tenant.clientType === 'CONTRACTOR') {
    return record.inspectorCount
  }
  return 1
}

function getUnitPrice(tenant: any): number {
  if (tenant.clientType === 'HOUSING_ASSOCIATION') {
    if (tenant.billingModel === 'PER_DOOR') {
      return tenant.pricePerDoor / 12 // Monthly rate
    } else if (tenant.billingModel === 'PER_BUILDING') {
      return tenant.pricePerBuilding / 12 // Monthly rate
    }
  } else if (tenant.clientType === 'CONTRACTOR') {
    return tenant.pricePerInspector // Already monthly
  }
  return 0
}

export async function getInvoicePDF(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      tenant: true
    }
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  // TODO: Generate PDF using PDFKit similar to other reports
  // This would be implemented similar to the existing report generators
  // For now, return the invoice data
  return invoice
}

export async function markInvoiceAsPaid(invoiceId: string, paidDate?: Date) {
  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidDate: paidDate || new Date()
    }
  })
}

export async function checkOverdueInvoices() {
  const now = new Date()

  // Find invoices that are overdue
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'ISSUED',
      dueDate: {
        lt: now
      }
    }
  })

  // Update status to OVERDUE
  for (const invoice of overdueInvoices) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'OVERDUE' }
    })
  }

  return overdueInvoices.length
}
