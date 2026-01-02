'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Building, DoorOpen, Users, CreditCard, Settings } from 'lucide-react'

interface TenantData {
  id: string
  companyName: string
  subdomain: string
  clientType: string
  billingModel: string
  billingCycle: string
  pricePerDoor: number
  pricePerInspector: number
  pricePerBuilding: number
  nextBillingDate: string | null
  subscriptionStatus: string
  userCount: number
  buildingCount: number
  doorCount: number
  inspectorCount: number
  estimatedMonthlyCost: number
  estimatedAnnualCost: number
  maxDoors?: number
  maxBuildings?: number
  maxUsers?: number
  maxInspectors?: number
}

export default function AdminTenantsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    billingModel: 'PER_DOOR',
    clientType: 'HOUSING_ASSOCIATION',
    billingCycle: 'ANNUAL',
    pricePerDoor: '12.00',
    pricePerInspector: '65.00',
    pricePerBuilding: '500.00',
    subscriptionStatus: 'ACTIVE',
    maxDoors: '1000',
    maxBuildings: '50',
    maxUsers: '10',
    maxInspectors: '5'
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.isSuperAdmin) {
      router.push('/dashboard')
      return
    }

    fetchTenants()
  }, [session, status, router])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (tenant: TenantData) => {
    setSelectedTenant(tenant)
    setFormData({
      billingModel: tenant.billingModel,
      clientType: tenant.clientType,
      billingCycle: tenant.billingCycle,
      pricePerDoor: tenant.pricePerDoor.toFixed(2),
      pricePerInspector: tenant.pricePerInspector.toFixed(2),
      pricePerBuilding: tenant.pricePerBuilding.toFixed(2),
      subscriptionStatus: tenant.subscriptionStatus,
      maxDoors: (tenant.maxDoors || 1000).toString(),
      maxBuildings: (tenant.maxBuildings || 50).toString(),
      maxUsers: (tenant.maxUsers || 10).toString(),
      maxInspectors: (tenant.maxInspectors || 5).toString()
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedTenant) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTenants()
        setEditDialogOpen(false)
        setSelectedTenant(null)
      } else {
        alert('Failed to update tenant billing')
      }
    } catch (error) {
      console.error('Error updating tenant:', error)
      alert('Failed to update tenant billing')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading tenant information...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.isSuperAdmin) {
    return null
  }

  const totalMonthlyRevenue = tenants.reduce((sum, t) => sum + t.estimatedMonthlyCost, 0)
  const totalAnnualRevenue = tenants.reduce((sum, t) => sum + t.estimatedAnnualCost, 0)
  const totalDoors = tenants.reduce((sum, t) => sum + t.doorCount, 0)
  const totalBuildings = tenants.reduce((sum, t) => sum + t.buildingCount, 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600 mt-1">Manage billing and subscriptions for all tenants</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalMonthlyRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalAnnualRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doors</CardTitle>
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDoors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>View and manage billing for all customer accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Client Type</TableHead>
                  <TableHead>Billing Model</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Annual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenant.companyName}</p>
                        <p className="text-sm text-gray-500">{tenant.subdomain}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tenant.clientType === 'HOUSING_ASSOCIATION' ? 'Housing' : 'Contractor'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tenant.billingModel.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <DoorOpen className="h-3 w-3" />
                          {tenant.doorCount}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Building className="h-3 w-3" />
                          {tenant.buildingCount}
                        </div>
                        {tenant.clientType === 'CONTRACTOR' && (
                          <div className="flex items-center justify-end gap-1">
                            <Users className="h-3 w-3" />
                            {tenant.inspectorCount}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      £{tenant.estimatedMonthlyCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      £{tenant.estimatedAnnualCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                        {tenant.subscriptionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(tenant)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Billing Settings</DialogTitle>
              <DialogDescription>
                Update billing configuration for {selectedTenant?.companyName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={formData.clientType}
                    onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOUSING_ASSOCIATION">Housing Association</SelectItem>
                      <SelectItem value="CONTRACTOR">Fire Safety Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Billing Model</Label>
                  <Select
                    value={formData.billingModel}
                    onValueChange={(value) => setFormData({ ...formData, billingModel: value })}
                  >
                    <SelectTrigger>
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
                  <Label>Billing Cycle</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Status</Label>
                  <Select
                    value={formData.subscriptionStatus}
                    onValueChange={(value) => setFormData({ ...formData, subscriptionStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Price Per Door (£/year)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerDoor}
                    onChange={(e) => setFormData({ ...formData, pricePerDoor: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price Per Inspector (£/month)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerInspector}
                    onChange={(e) => setFormData({ ...formData, pricePerInspector: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price Per Building (£/year)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerBuilding}
                    onChange={(e) => setFormData({ ...formData, pricePerBuilding: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Resource Limits</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Max Doors</Label>
                    <Input
                      type="number"
                      value={formData.maxDoors}
                      onChange={(e) => setFormData({ ...formData, maxDoors: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Current: {selectedTenant?.doorCount || 0}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Buildings</Label>
                    <Input
                      type="number"
                      value={formData.maxBuildings}
                      onChange={(e) => setFormData({ ...formData, maxBuildings: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Current: {selectedTenant?.buildingCount || 0}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Users</Label>
                    <Input
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Current: {selectedTenant?.userCount || 0}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Inspectors</Label>
                    <Input
                      type="number"
                      value={formData.maxInspectors}
                      onChange={(e) => setFormData({ ...formData, maxInspectors: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Current: {selectedTenant?.inspectorCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
