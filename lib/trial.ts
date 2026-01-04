import { Tenant } from '@prisma/client'

export interface TrialStatus {
  isActive: boolean
  daysRemaining: number | null
  hasExpired: boolean
  isOnTrial: boolean
}

export function getTrialStatus(tenant: Tenant): TrialStatus {
  const isOnTrial = tenant.subscriptionPlan === 'trial'

  if (!isOnTrial || !tenant.trialEndsAt) {
    return {
      isActive: tenant.subscriptionStatus === 'active',
      daysRemaining: null,
      hasExpired: false,
      isOnTrial: false
    }
  }

  const now = new Date()
  const trialEnds = new Date(tenant.trialEndsAt)
  const hasExpired = now > trialEnds

  // Calculate days remaining
  const timeDiff = trialEnds.getTime() - now.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

  return {
    isActive: !hasExpired && tenant.subscriptionStatus === 'active',
    daysRemaining: hasExpired ? 0 : daysRemaining,
    hasExpired,
    isOnTrial: true
  }
}

export function formatTrialMessage(trialStatus: TrialStatus): string {
  if (!trialStatus.isOnTrial) {
    return ''
  }

  if (trialStatus.hasExpired) {
    return 'Your trial has expired. Please upgrade to continue using the platform.'
  }

  if (trialStatus.daysRemaining !== null) {
    if (trialStatus.daysRemaining === 0) {
      return 'Your trial expires today!'
    } else if (trialStatus.daysRemaining === 1) {
      return 'Your trial expires tomorrow.'
    } else if (trialStatus.daysRemaining <= 3) {
      return `Your trial expires in ${trialStatus.daysRemaining} days.`
    } else {
      return `Trial: ${trialStatus.daysRemaining} days remaining`
    }
  }

  return ''
}
