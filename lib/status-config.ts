export const STATUS_CONFIG = {
  PASS: {
    label: 'Compliant',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    badgeVariant: 'default' as const,
    icon: '✓',
    tooltip: 'Door meets all fire safety requirements and is fully compliant'
  },
  PENDING: {
    label: 'Pending',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    badgeVariant: 'secondary' as const,
    icon: '◷',
    tooltip: 'Inspection scheduled but not yet completed'
  },
  REQUIRES_ACTION: {
    label: 'Requires Attention',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    badgeVariant: 'outline' as const,
    icon: '⚠',
    tooltip: 'Non-critical defect identified. Fix required before next inspection cycle'
  },
  FAIL: {
    label: 'Non-Compliant',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const,
    icon: '✗',
    tooltip: 'Door cannot perform its intended fire resistance. Immediate action needed'
  },
  OVERDUE: {
    label: 'Overdue',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    badgeVariant: 'outline' as const,
    icon: '!',
    tooltip: 'Inspection is past due date. Schedule inspection immediately'
  }
} as const

export type StatusKey = keyof typeof STATUS_CONFIG

export function getStatusConfig(status: string) {
  // Map database statuses to our config keys
  const statusMap: Record<string, StatusKey> = {
    'PASS': 'PASS',
    'FAIL': 'FAIL',
    'PENDING': 'PENDING',
    'REQUIRES_ACTION': 'REQUIRES_ACTION',
    'OVERDUE': 'OVERDUE'
  }

  const key = statusMap[status] || 'PENDING'
  return STATUS_CONFIG[key]
}
