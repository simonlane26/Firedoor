'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CreditCard, Building, Users, DoorOpen, TrendingUp, FileText, Settings } from 'lucide-react'

interface BillingData {
  billing: {
    billingModel: string
    clientType: string
    billingCycle: string
    pricePerDoor: number
    pricePerInspector: number
    pricePerBuilding: number
    nextBillingDate: string | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
  }
  usage: {
    doorCount: number
    buildingCount: number
    inspectorCount: number
    inspectionCount: number
  }
  costs: {
    estimatedMonthlyCost: number
    estimatedAnnualCost: number
  }
  recentInvoices: Array<{
    id: string
    invoiceNumber: string
    amount: number
    status: string
    issueDate: string
    dueDate: string
    paidDate: string | null
  }>
  currentUsageRecord: {
    doorCount: number
    buildingCount: number
    inspectorCount: number
    inspectionCount: number
    calculatedAmount: number
  } | null
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    billingModel: 'PER_DOOR',
    clientType: 'HOUSING_ASSOCIATION',
    billingCycle: 'ANNUAL',
    pricePerDoor: '12.00',
    pricePerInspector: '65.00',
    pricePerBuilding: '500.00'
  })

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing')
      if (response.ok) {
        const data = await response.json()
        setBillingData(data)
        setFormData({
          billingModel: data.billing.billingModel,
          clientType: data.billing.clientType,
          billingCycle: data.billing.billingCycle,
          pricePerDoor: data.billing.pricePerDoor.toFixed(2),
          pricePerInspector: data.billing.pricePerInspector.toFixed(2),
          pricePerBuilding: data.billing.pricePerBuilding.toFixed(2)
        })
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchBillingData()
        setEditMode(false)
      } else {
        alert('Failed to update billing settings')
      }
    } catch (error) {
      console.error('Error updating billing settings:', error)
      alert('Failed to update billing settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>No billing data available</p>
        </div>
      </div>
    )
  }

  const isSuperAdmin = session?.user?.isSuperAdmin === true

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

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600 mt-1">{isSuperAdmin ? 'Manage tenant subscription plan and view usage' : 'View your subscription plan and usage'}</p>
            </div>
            {isSuperAdmin && !editMode && (
              <Button onClick={() => setEditMode(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            )}
            {isSuperAdmin && editMode && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{billingData.costs.estimatedMonthlyCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Cost</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{billingData.costs.estimatedAnnualCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billing Model</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData.billing.billingModel.replace('_', ' ')}</div>
              <p className="text-xs text-muted-foreground">{billingData.billing.billingCycle}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Type</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{billingData.billing.clientType.replace('_', ' ')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>Your current resource usage this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <DoorOpen className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fire Doors</p>
                  <p className="text-2xl font-bold">{billingData.usage.doorCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Buildings</p>
                  <p className="text-2xl font-bold">{billingData.usage.buildingCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inspectors</p>
                  <p className="text-2xl font-bold">{billingData.usage.inspectorCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inspections (This Month)</p>
                  <p className="text-2xl font-bold">{billingData.usage.inspectionCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure your billing preferences and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientType">Client Type</Label>
                  <Select
                    value={formData.clientType}
                    onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                    disabled={!editMode}
                  >
                    <SelectTrigger id="clientType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOUSING_ASSOCIATION">Housing Association</SelectItem>
                      <SelectItem value="CONTRACTOR">Fire Safety Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingModel">Billing Model</Label>
                  <Select
                    value={formData.billingModel}
                    onValueChange={(value) => setFormData({ ...formData, billingModel: value })}
                    disabled={!editMode}
                  >
                    <SelectTrigger id="billingModel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.clientType === 'HOUSING_ASSOCIATION' && (
                        <>
                          <SelectItem value="PER_DOOR">Per Door</SelectItem>
                          <SelectItem value="PER_BUILDING">Per Building</SelectItem>
                        </>
                      )}
                      {formData.clientType === 'CONTRACTOR' && (
                        <SelectItem value="PER_INSPECTOR">Per Inspector + Per Door</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                    disabled={!editMode}
                  >
                    <SelectTrigger id="billingCycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDoor">Price Per Door (£/year)</Label>
                  <Input
                    id="pricePerDoor"
                    type="number"
                    step="0.01"
                    value={formData.pricePerDoor}
                    onChange={(e) => setFormData({ ...formData, pricePerDoor: e.target.value })}
                    disabled={!editMode}
                  />
                  <p className="text-xs text-gray-500">Recommended: £8-15/year for Housing Associations</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerInspector">Price Per Inspector (£/month)</Label>
                  <Input
                    id="pricePerInspector"
                    type="number"
                    step="0.01"
                    value={formData.pricePerInspector}
                    onChange={(e) => setFormData({ ...formData, pricePerInspector: e.target.value })}
                    disabled={!editMode}
                  />
                  <p className="text-xs text-gray-500">Recommended: £50-80/month for Contractors</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerBuilding">Price Per Building (£/year)</Label>
                  <Input
                    id="pricePerBuilding"
                    type="number"
                    step="0.01"
                    value={formData.pricePerBuilding}
                    onChange={(e) => setFormData({ ...formData, pricePerBuilding: e.target.value })}
                    disabled={!editMode}
                  />
                  <p className="text-xs text-gray-500">Recommended: £300-2,000/year (size-dependent)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>View your recent billing history</CardDescription>
          </CardHeader>
          <CardContent>
            {billingData.recentInvoices.length === 0 ? (
              <p className="text-gray-500">No invoices yet</p>
            ) : (
              <div className="space-y-4">
                {billingData.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        Issued: {new Date(invoice.issueDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">£{invoice.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === 'PAID'
                            ? 'default'
                            : invoice.status === 'OVERDUE'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Understanding your billing structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingData.billing.clientType === 'HOUSING_ASSOCIATION' && (
              <div className="space-y-2">
                <h3 className="font-semibold">Housing Association Pricing</h3>
                {billingData.billing.billingModel === 'PER_DOOR' && (
                  <p className="text-sm text-gray-600">
                    You are billed <strong>£{billingData.billing.pricePerDoor.toFixed(2)}</strong> per fire door per year.
                    With {billingData.usage.doorCount} doors, your estimated annual cost is £{billingData.costs.estimatedAnnualCost.toFixed(2)}.
                  </p>
                )}
                {billingData.billing.billingModel === 'PER_BUILDING' && (
                  <p className="text-sm text-gray-600">
                    You are billed <strong>£{billingData.billing.pricePerBuilding.toFixed(2)}</strong> per building per year.
                    With {billingData.usage.buildingCount} buildings, your estimated annual cost is £{billingData.costs.estimatedAnnualCost.toFixed(2)}.
                  </p>
                )}
              </div>
            )}

            {billingData.billing.clientType === 'CONTRACTOR' && (
              <div className="space-y-2">
                <h3 className="font-semibold">Fire Safety Contractor Pricing</h3>
                <p className="text-sm text-gray-600">
                  You are billed <strong>£{billingData.billing.pricePerInspector.toFixed(2)}</strong> per inspector per month,
                  plus <strong>£{(billingData.billing.pricePerDoor / 12).toFixed(2)}</strong> per door per month for data storage.
                </p>
                <p className="text-sm text-gray-600">
                  With {billingData.usage.inspectorCount} inspectors and {billingData.usage.doorCount} doors,
                  your estimated monthly cost is £{billingData.costs.estimatedMonthlyCost.toFixed(2)}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
