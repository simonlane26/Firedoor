'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/logout-button'
import { AppHeader } from '@/components/app-header'

export function DashboardHeader() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <AppHeader />
        <div className="flex items-center gap-4">
          {session.user.isSuperAdmin && (
            <Link href="/admin/tenants">
              <Button variant="outline" size="sm">
                Tenant Management
              </Button>
            </Link>
          )}
          {session.user.role === 'ADMIN' && (
            <Link href="/settings/users">
              <Button variant="outline" size="sm">
                Users
              </Button>
            </Link>
          )}
          <Link href="/settings/billing">
            <Button variant="outline" size="sm">
              Billing
            </Button>
          </Link>
          <Link href="/settings/branding">
            <Button variant="outline" size="sm">
              Branding
            </Button>
          </Link>
          <Link href="/settings/tenant">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
          <span className="text-sm text-slate-600">{session.user.name}</span>
          <Badge variant="outline">{session.user.role}</Badge>
          {session.user.isSuperAdmin && (
            <Badge variant="default" className="bg-purple-600">SUPER ADMIN</Badge>
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
