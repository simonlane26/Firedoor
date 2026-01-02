import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { generateInvoice } from '@/lib/invoice-generator'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: user.tenant.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: 'Only super admins can generate invoices' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { billingPeriodStart, billingPeriodEnd, dueInDays } = body

    const invoice = await generateInvoice({
      tenantId: user.tenant.id,
      billingPeriodStart: new Date(billingPeriodStart),
      billingPeriodEnd: new Date(billingPeriodEnd),
      dueInDays: dueInDays || 30
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
