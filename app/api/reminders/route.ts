import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendInspectionReminders, sendOverdueReminders, updateNextInspectionDates } from '@/lib/reminders'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Allow cron jobs or admins only
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isAuthorized =
    (session?.user?.role === 'ADMIN') ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, daysThreshold } = body

    let result

    switch (action) {
      case 'send':
        // Send reminders for doors due in X days
        const days = daysThreshold || 30
        result = await sendInspectionReminders(days)
        return NextResponse.json({
          success: true,
          action: 'send',
          daysThreshold: days,
          stats: result,
        })

      case 'overdue':
        // Send overdue reminders
        result = await sendOverdueReminders()
        return NextResponse.json({
          success: true,
          action: 'overdue',
          stats: result,
        })

      case 'update':
        // Update next inspection dates
        const updated = await updateNextInspectionDates()
        return NextResponse.json({
          success: true,
          action: 'update',
          doorsUpdated: updated,
        })

      case 'all':
        // Run all reminder schedules
        await updateNextInspectionDates()
        const overdue = await sendOverdueReminders()
        const upcoming30 = await sendInspectionReminders(30)
        const upcoming14 = await sendInspectionReminders(14)
        const upcoming7 = await sendInspectionReminders(7)
        const upcoming1 = await sendInspectionReminders(1)

        return NextResponse.json({
          success: true,
          action: 'all',
          results: {
            overdue,
            days30: upcoming30,
            days14: upcoming14,
            days7: upcoming7,
            days1: upcoming1,
          },
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: send, overdue, update, or all' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing reminder request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check reminder status
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get count of doors needing inspection soon
    const { prisma } = await import('@/lib/prisma')

    const overdueCount = await prisma.fireDoor.count({
      where: {
        nextInspectionDate: {
          not: null,
          lt: new Date(),
        }
      }
    })

    const due30Days = await prisma.fireDoor.count({
      where: {
        nextInspectionDate: {
          not: null,
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        }
      }
    })

    const due7Days = await prisma.fireDoor.count({
      where: {
        nextInspectionDate: {
          not: null,
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        }
      }
    })

    return NextResponse.json({
      overdueCount,
      due30Days,
      due7Days,
    })
  } catch (error) {
    console.error('Error fetching reminder status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
