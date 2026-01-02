'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2, Palette, CreditCard } from 'lucide-react'

interface Tenant {
  id: string
  companyName: string
  subdomain: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  contactEmail: string | null
  contactPhone: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  maxDoors: number
  maxUsers: number
}

export default function TenantSettingsPage() {
  const { data: session } = useSession()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
  })

  useEffect(() => {
    fetchTenant()
  }, [])

  async function fetchTenant() {
    try {
      const response = await fetch('/api/tenant')
      const data = await response.json()
      setTenant(data)
      setFormData({
        companyName: data.companyName,
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      })
    } catch (error) {
      console.error('Error fetching tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updated = await response.json()
        setTenant(updated)
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving tenant:', error)
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-600">Loading tenant settings...</p>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">No tenant found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session?.user.name}</span>
            <Badge variant="outline">{session?.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tenant Settings</h1>
          <p className="text-slate-600">Manage your organization settings and branding</p>
        </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={tenant?.subdomain || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Subdomain cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>Customize your app's appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor || '#dc2626'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.primaryColor || '#dc2626'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor || '#991b1b'}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.secondaryColor || '#991b1b'}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Logo Upload (Coming Soon)</p>
              <p className="text-xs text-gray-500 mt-1">
                Upload your company logo to customize the dashboard header
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Plan:</span>
                <Badge variant="default" className="text-lg px-4 py-1">
                  {tenant?.subscriptionPlan?.toUpperCase() || 'TRIAL'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={tenant?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {tenant?.subscriptionStatus?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Doors:</span>
                  <span className="font-semibold">{tenant?.maxDoors || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Users:</span>
                  <span className="font-semibold">{tenant?.maxUsers || 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Billing and plan upgrades coming soon
                </p>
                <Button variant="outline" disabled>
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}
