'use client'

import { SessionProvider } from 'next-auth/react'
import { BrandingProvider } from '@/components/branding-provider'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BrandingProvider>
        {children}
        <Toaster />
      </BrandingProvider>
    </SessionProvider>
  )
}
