'use client'

import { LimitWarningBanner } from './limit-warning-banner'

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mb-4">
        <LimitWarningBanner />
      </div>
      {children}
    </>
  )
}
