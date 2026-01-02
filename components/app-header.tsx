'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface BrandingData {
  logoUrl: string | null
  companyName: string | null
  primaryColor: string | null
  accentColor: string | null
}

export function AppHeader() {
  const [branding, setBranding] = useState<BrandingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/branding')
      if (response.ok) {
        const data = await response.json()
        setBranding(data)
      }
    } catch (error) {
      console.error('Error fetching branding:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse"></div>
        <div>
          <div className="h-5 w-40 bg-slate-200 animate-pulse rounded"></div>
          <div className="h-3 w-32 bg-slate-200 animate-pulse rounded mt-1"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {branding?.logoUrl ? (
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-slate-200">
          <Image
            src={branding.logoUrl}
            alt={branding.companyName || 'Company logo'}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {branding?.companyName || 'Fire Door Inspector'}
        </h1>
        <p className="text-sm text-slate-500">Compliance Dashboard</p>
      </div>
    </div>
  )
}
