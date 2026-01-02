'use client'

import { useEffect, useState } from 'react'
import { generateCssVariables, BrandingConfig } from '@/lib/branding'

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null)

  useEffect(() => {
    fetchBranding()
  }, [])

  useEffect(() => {
    if (branding) {
      applyBranding(branding)
    }
  }, [branding])

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/branding')
      if (response.ok) {
        const data = await response.json()
        setBranding(data)
      }
    } catch (error) {
      console.error('Error fetching branding:', error)
    }
  }

  const applyBranding = (config: BrandingConfig) => {
    // Apply CSS variables
    const css = generateCssVariables(config)

    // Remove existing branding style tag if it exists
    const existingStyle = document.getElementById('branding-styles')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create and inject new style tag
    const style = document.createElement('style')
    style.id = 'branding-styles'
    style.textContent = css
    document.head.appendChild(style)

    // Update favicon if provided
    if (config.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = config.faviconUrl
    }

    // Update document title with company name
    if (config.companyName) {
      const titleSuffix = ' - Fire Door Inspector'
      const currentTitle = document.title
      if (!currentTitle.includes(config.companyName)) {
        document.title = config.companyName + titleSuffix
      }
    }
  }

  return <>{children}</>
}
