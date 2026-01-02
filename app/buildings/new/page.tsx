'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NewBuildingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    postcode: '',
    buildingType: 'RESIDENTIAL',
    numberOfStoreys: '',
    topStoreyHeight: '',
    contactName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create building', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Building</CardTitle>
            <CardDescription>Register a building for fire door inspection management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Building Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Riverside Apartments"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  placeholder="e.g. SW1A 1AA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingType">Building Type</Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) => setFormData({ ...formData, buildingType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                    <SelectItem value="HMO">HMO's (Shared Living)</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="MIXED_USE">Mixed Use</SelectItem>
                    <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="HOTEL">Hotel</SelectItem>
                    <SelectItem value="HOSTEL">Hostel</SelectItem>
                    <SelectItem value="GUEST_HOUSE">Guest House</SelectItem>
                    <SelectItem value="EDUCATION">Education</SelectItem>
                    <SelectItem value="CHILDCARE">Childcare</SelectItem>
                    <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    <SelectItem value="CARE_FACILITY">Care Facility</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="SPECIALITY_ACCOMMODATION">Speciality Accommodation</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="COMMUNITY">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfStoreys">Number of Storeys</Label>
                  <Input
                    id="numberOfStoreys"
                    type="number"
                    value={formData.numberOfStoreys}
                    onChange={(e) => setFormData({ ...formData, numberOfStoreys: e.target.value })}
                    placeholder="e.g. 8"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topStoreyHeight">Top Storey Height (m)</Label>
                  <Input
                    id="topStoreyHeight"
                    type="number"
                    step="0.1"
                    value={formData.topStoreyHeight}
                    onChange={(e) => setFormData({ ...formData, topStoreyHeight: e.target.value })}
                    placeholder="e.g. 24.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Responsible Person</h3>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. John Smith"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <strong>Inspection Requirements:</strong> Buildings &gt;11m: Quarterly for communal doors (legal), Annually for flat entrance doors (legal). Commercial/Industrial: 6-monthly minimum. Schools/Hospitals/Healthcare: 3-6 months based on risk. HMOs/Low-rise residential: 6-monthly recommended.
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Building'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
