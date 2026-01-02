import { prisma } from './prisma'
import { sendEmail } from './email'
import { getInspectionReminderTemplate } from './email-templates'

interface ReminderStats {
  emailsSent: number
  doorsReminded: number
  tenantReminders: {
    [tenantId: string]: {
      tenantName: string
      doorCount: number
    }
  }
}

/**
 * Calculate next inspection date based on door type
 * - FLAT_ENTRANCE: 12 months
 * - Others (COMMUNAL): 3 months
 */
export function calculateNextInspectionDate(doorType: string, lastInspectionDate: Date): Date {
  const nextDate = new Date(lastInspectionDate)

  if (doorType === 'FLAT_ENTRANCE') {
    // 12 months for flat entrance doors
    nextDate.setMonth(nextDate.getMonth() + 12)
  } else {
    // 3 months for communal doors
    nextDate.setMonth(nextDate.getMonth() + 3)
  }

  return nextDate
}

/**
 * Get days until inspection due
 */
function getDaysUntilDue(nextInspectionDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(nextInspectionDate)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Send inspection reminders for doors due in X days
 * @param daysThreshold - Send reminders for doors due in this many days (e.g., 30, 14, 7, 1)
 */
export async function sendInspectionReminders(daysThreshold: number): Promise<ReminderStats> {
  const stats: ReminderStats = {
    emailsSent: 0,
    doorsReminded: 0,
    tenantReminders: {},
  }

  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          where: {
            OR: [
              { role: 'ADMIN' },
              { role: 'MANAGER' }
            ]
          },
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    for (const tenant of tenants) {
      // Get doors needing inspection for this tenant
      const doorsNeedingInspection = await prisma.fireDoor.findMany({
        where: {
          tenantId: tenant.id,
          nextInspectionDate: {
            not: null,
            lte: new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000),
          }
        },
        include: {
          building: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          nextInspectionDate: 'asc'
        }
      })

      if (doorsNeedingInspection.length === 0) {
        continue
      }

      // Prepare door data for email
      const doorData = doorsNeedingInspection.map((door) => {
        const daysUntilDue = getDaysUntilDue(door.nextInspectionDate!)

        return {
          doorNumber: door.doorNumber,
          location: door.location,
          building: door.building.name,
          daysUntilDue,
          nextInspectionDate: door.nextInspectionDate!.toLocaleDateString('en-GB'),
        }
      })

      // Determine urgency
      const minDays = Math.min(...doorData.map(d => d.daysUntilDue))
      const urgency = minDays < 0 ? 'critical' : minDays <= 7 ? 'urgent' : 'upcoming'

      // Generate email
      const emailHtml = getInspectionReminderTemplate({
        tenantName: tenant.companyName,
        doorCount: doorsNeedingInspection.length,
        doors: doorData,
        urgency,
      })

      // Send to all admins and managers
      const recipients = tenant.users.map(u => u.email)

      if (recipients.length > 0) {
        const subject = urgency === 'critical'
          ? `🚨 OVERDUE: ${doorsNeedingInspection.length} Fire Door Inspection${doorsNeedingInspection.length > 1 ? 's' : ''}`
          : `🚪 Fire Door Inspection Reminder - ${doorsNeedingInspection.length} Door${doorsNeedingInspection.length > 1 ? 's' : ''}`

        const result = await sendEmail({
          to: recipients,
          subject,
          html: emailHtml,
        })

        if (result.success) {
          stats.emailsSent++
          stats.doorsReminded += doorsNeedingInspection.length
          stats.tenantReminders[tenant.id] = {
            tenantName: tenant.companyName,
            doorCount: doorsNeedingInspection.length,
          }

          console.log(`✅ Sent reminder to ${tenant.companyName} for ${doorsNeedingInspection.length} doors`)
        } else {
          console.error(`❌ Failed to send reminder to ${tenant.companyName}:`, result.error)
        }
      }
    }

    return stats
  } catch (error) {
    console.error('Error sending inspection reminders:', error)
    throw error
  }
}

/**
 * Send reminders for overdue inspections
 */
export async function sendOverdueReminders(): Promise<ReminderStats> {
  return sendInspectionReminders(-1) // Any doors past due
}

/**
 * Update next inspection dates based on completed inspections
 */
export async function updateNextInspectionDates(): Promise<number> {
  let updated = 0

  try {
    // Get all doors
    const doors = await prisma.fireDoor.findMany({
      include: {
        inspections: {
          where: {
            status: 'COMPLETED',
            overallResult: 'PASS'
          },
          orderBy: {
            inspectionDate: 'desc'
          },
          take: 1
        }
      }
    })

    for (const door of doors) {
      if (door.inspections.length > 0) {
        const lastInspection = door.inspections[0]
        const nextDate = calculateNextInspectionDate(door.doorType, lastInspection.inspectionDate)

        await prisma.fireDoor.update({
          where: { id: door.id },
          data: { nextInspectionDate: nextDate }
        })

        updated++
      }
    }

    console.log(`✅ Updated next inspection dates for ${updated} doors`)
    return updated
  } catch (error) {
    console.error('Error updating next inspection dates:', error)
    throw error
  }
}
