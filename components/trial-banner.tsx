import { AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { getTrialStatus, formatTrialMessage } from '@/lib/trial'
import { Tenant } from '@prisma/client'

interface TrialBannerProps {
  tenant: Tenant
}

export function TrialBanner({ tenant }: TrialBannerProps) {
  const trialStatus = getTrialStatus(tenant)

  if (!trialStatus.isOnTrial) {
    return null
  }

  const message = formatTrialMessage(trialStatus)

  if (!message) {
    return null
  }

  // Show different colors based on urgency
  const isUrgent = trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3
  const bgColor = isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
  const textColor = isUrgent ? 'text-orange-900' : 'text-blue-900'
  const iconColor = isUrgent ? 'text-orange-600' : 'text-blue-600'

  return (
    <div className={`border rounded-lg p-4 mb-6 ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Clock className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          <p className="text-xs text-slate-600 mt-1">
            Upgrade now to continue using all features after your trial ends.
          </p>
        </div>
        <Link href={`mailto:sales@firedoorchecks.com?subject=Upgrade Request - ${tenant.companyName}`}>
          <Button size="sm" variant={isUrgent ? 'default' : 'outline'}>
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
