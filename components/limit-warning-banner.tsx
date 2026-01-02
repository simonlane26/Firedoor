'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LimitInfo {
  current: number
  limit: number
  percentage: number
  remaining: number
  isNearLimit: boolean
  isAtLimit: boolean
}

interface Limits {
  doors: LimitInfo
  buildings: LimitInfo
  users: LimitInfo
  inspectors: LimitInfo
}

export function LimitWarningBanner() {
  const [limits, setLimits] = useState<Limits | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/limits')
      if (response.ok) {
        const data = await response.json()
        setLimits(data)
      }
    } catch (error) {
      console.error('Error fetching limits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !limits) {
    return null
  }

  const warnings: Array<{ key: string; title: string; message: string; isAtLimit: boolean }> = []

  Object.entries(limits).forEach(([resource, info]) => {
    if (info.isAtLimit && !dismissed.has(`${resource}-at-limit`)) {
      warnings.push({
        key: `${resource}-at-limit`,
        title: `${resource.charAt(0).toUpperCase() + resource.slice(1)} Limit Reached`,
        message: `You have reached your ${resource} limit (${info.current}/${info.limit}). You cannot add more ${resource} until you upgrade your plan.`,
        isAtLimit: true
      })
    } else if (info.isNearLimit && !dismissed.has(`${resource}-near-limit`)) {
      warnings.push({
        key: `${resource}-near-limit`,
        title: `Approaching ${resource.charAt(0).toUpperCase() + resource.slice(1)} Limit`,
        message: `You are approaching your ${resource} limit (${info.current}/${info.limit}, ${info.remaining} remaining). Consider upgrading your plan.`,
        isAtLimit: false
      })
    }
  })

  if (warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning) => (
        <Alert key={warning.key} variant={warning.isAtLimit ? 'destructive' : 'default'} className="relative">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{warning.title}</AlertTitle>
          <AlertDescription>
            {warning.message}
            {warning.isAtLimit && (
              <span className="block mt-2 font-medium">
                Contact support to upgrade your plan.
              </span>
            )}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              const newDismissed = new Set(dismissed)
              newDismissed.add(warning.key)
              setDismissed(newDismissed)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
