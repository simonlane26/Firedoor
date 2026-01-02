interface InspectionReminderData {
  tenantName: string
  doorCount: number
  doors: Array<{
    doorNumber: string
    location: string
    building: string
    daysUntilDue: number
    nextInspectionDate: string
  }>
  urgency: 'critical' | 'urgent' | 'upcoming'
}

export function getInspectionReminderTemplate(data: InspectionReminderData): string {
  const { tenantName, doorCount, doors, urgency } = data

  const urgencyColors = {
    critical: { bg: '#dc2626', text: 'OVERDUE - IMMEDIATE ACTION REQUIRED' },
    urgent: { bg: '#ea580c', text: 'INSPECTION DUE SOON' },
    upcoming: { bg: '#2563eb', text: 'UPCOMING INSPECTION' },
  }

  const color = urgencyColors[urgency]

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fire Door Inspection Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${color.bg}; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🚪 Fire Door Inspection Reminder
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                ${color.text}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                Dear ${tenantName} Team,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                This is a reminder that <strong>${doorCount}</strong> fire door${doorCount > 1 ? 's require' : ' requires'} inspection.
              </p>

              ${urgency === 'critical' ? `
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; color: #991b1b; font-weight: 600;">
                    ⚠️ CRITICAL: These inspections are overdue and require immediate attention to maintain compliance.
                  </p>
                </div>
              ` : ''}

              <!-- Doors List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 4px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                      DOOR
                    </th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                      LOCATION
                    </th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                      DUE DATE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${doors.map((door, index) => `
                    <tr style="${index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f9fafb;'}">
                      <td style="padding: 12px; font-size: 14px; color: #111827; border-bottom: ${index === doors.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                        <strong>${door.doorNumber}</strong>
                      </td>
                      <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: ${index === doors.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                        ${door.location}<br>
                        <span style="font-size: 12px; color: #6b7280;">${door.building}</span>
                      </td>
                      <td style="padding: 12px; font-size: 14px; text-align: right; border-bottom: ${index === doors.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                        ${door.nextInspectionDate}
                        ${door.daysUntilDue < 0
                          ? `<br><span style="font-size: 12px; color: #dc2626; font-weight: 600;">${Math.abs(door.daysUntilDue)} days overdue</span>`
                          : `<br><span style="font-size: 12px; color: #6b7280;">${door.daysUntilDue} days remaining</span>`
                        }
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Action Required -->
              <div style="background-color: #eff6ff; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1e40af;">
                  📋 Action Required
                </h3>
                <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                  Please schedule inspections for the listed doors to ensure compliance with the Fire Safety (England) Regulations 2022.
                </p>
              </div>

              <!-- Login Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard"
                   style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Dashboard
                </a>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                If you have any questions or need assistance, please contact your fire safety coordinator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280;">
                🤖 Generated with Fire Door Inspector
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated reminder. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function getOverdueInspectionTemplate(data: InspectionReminderData): string {
  return getInspectionReminderTemplate({ ...data, urgency: 'critical' })
}

export function getUpcomingInspectionTemplate(data: InspectionReminderData): string {
  return getInspectionReminderTemplate({ ...data, urgency: 'upcoming' })
}

interface ContractorAssignmentData {
  contractorName: string
  contractorCompany: string
  ticketNumber: string
  defectDescription: string
  severity: string
  priority: string
  category: string
  doorNumber: string
  doorLocation: string
  buildingName: string
  buildingAddress: string
  detectedDate: string
  targetCompletionDate?: string
  tenantName: string
}

export function getContractorAssignmentTemplate(data: ContractorAssignmentData): string {
  const {
    contractorName,
    contractorCompany,
    ticketNumber,
    defectDescription,
    severity,
    priority,
    category,
    doorNumber,
    doorLocation,
    buildingName,
    buildingAddress,
    detectedDate,
    targetCompletionDate,
    tenantName
  } = data

  const severityColors = {
    CRITICAL: { bg: '#dc2626', badge: '#991b1b' },
    MAJOR: { bg: '#ea580c', badge: '#9a3412' },
    MINOR: { bg: '#eab308', badge: '#854d0e' }
  }

  const priorityColors = {
    URGENT: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#eab308',
    LOW: '#3b82f6'
  }

  const severityColor = severityColors[severity as keyof typeof severityColors] || severityColors.MINOR
  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.MEDIUM

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Defect Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${severityColor.bg}; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🔧 New Defect Assignment
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                ${ticketNumber}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                Dear ${contractorName} (${contractorCompany}),
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                You have been assigned a new fire door defect repair by <strong>${tenantName}</strong>.
              </p>

              <!-- Severity and Priority Badges -->
              <div style="margin: 20px 0;">
                <span style="display: inline-block; background-color: ${severityColor.badge}; color: #ffffff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 8px;">
                  ${severity} SEVERITY
                </span>
                <span style="display: inline-block; background-color: ${priorityColor}; color: #ffffff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  ${priority} PRIORITY
                </span>
              </div>

              <!-- Defect Details -->
              <div style="background-color: #f9fafb; border-radius: 4px; padding: 20px; margin: 20px 0; border-left: 4px solid ${severityColor.bg};">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">
                  📋 Defect Details
                </h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 140px; vertical-align: top;">
                      <strong>Category:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${category}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280; vertical-align: top;">
                      <strong>Description:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${defectDescription}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280; vertical-align: top;">
                      <strong>Detected Date:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${new Date(detectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                  ${targetCompletionDate ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280; vertical-align: top;">
                      <strong>Target Date:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600;">
                      ${new Date(targetCompletionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Location Details -->
              <div style="background-color: #eff6ff; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e40af;">
                  📍 Location
                </h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #3b82f6; width: 140px;">
                      <strong>Door:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${doorNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #3b82f6;">
                      <strong>Door Location:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${doorLocation}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #3b82f6;">
                      <strong>Building:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${buildingName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #3b82f6; vertical-align: top;">
                      <strong>Address:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                      ${buildingAddress}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action Required -->
              <div style="background-color: #fef3c7; border-radius: 4px; padding: 20px; margin: 20px 0; border-left: 4px solid #eab308;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">
                  ⚠️ Action Required
                </h3>
                <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                  Please review this defect and schedule the necessary repairs. ${targetCompletionDate ? `This work should be completed by <strong>${new Date(targetCompletionDate).toLocaleDateString('en-GB')}</strong>.` : 'Please coordinate with the property manager to schedule the repair.'}
                </p>
              </div>

              <!-- Login Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/defects/${ticketNumber}"
                   style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Defect Details
                </a>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                If you have any questions about this assignment, please contact ${tenantName} directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280;">
                🤖 Generated with Fire Door Inspector
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated notification. For support, please contact ${tenantName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
