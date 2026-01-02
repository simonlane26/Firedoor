'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardHeader } from '@/components/dashboard-header'
import { toast } from '@/components/ui/use-toast'

interface Contractor {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string | null
  specialties: string | null
  averageCompletionDays: number | null
  completedJobs: number
  rating: number | null
  isActive: boolean
  _count: {
    defects: number
  }
}

export default function ContractorsPage() {
  const router = useRouter()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    specialties: [] as string[]
  })
  const [specialtyInput, setSpecialtyInput] = useState('')

  useEffect(() => {
    fetchContractors()
  }, [])

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/contractors')
      if (!response.ok) throw new Error('Failed to fetch contractors')
      const data = await response.json()
      setContractors(data)
    } catch (error) {
      console.error('Error fetching contractors:', error)
      toast({
        title: 'Error',
        description: 'Failed to load contractors',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddContractor = async () => {
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contractor')
      }

      toast({
        title: 'Success',
        description: 'Contractor added successfully'
      })

      setIsAddDialogOpen(false)
      resetForm()
      fetchContractors()
    } catch (error: any) {
      console.error('Error adding contractor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add contractor',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateContractor = async () => {
    if (!editingContractor) return

    try {
      const response = await fetch(`/api/contractors/${editingContractor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update contractor')
      }

      toast({
        title: 'Success',
        description: 'Contractor updated successfully'
      })

      setEditingContractor(null)
      resetForm()
      fetchContractors()
    } catch (error: any) {
      console.error('Error updating contractor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contractor',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (contractor: Contractor) => {
    try {
      const response = await fetch(`/api/contractors/${contractor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !contractor.isActive })
      })

      if (!response.ok) throw new Error('Failed to update contractor status')

      toast({
        title: 'Success',
        description: `Contractor ${contractor.isActive ? 'deactivated' : 'activated'}`
      })

      fetchContractors()
    } catch (error) {
      console.error('Error toggling contractor status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update contractor status',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      specialties: []
    })
    setSpecialtyInput('')
  }

  const openEditDialog = (contractor: Contractor) => {
    setEditingContractor(contractor)
    setFormData({
      companyName: contractor.companyName,
      contactName: contractor.contactName,
      email: contractor.email,
      phone: contractor.phone,
      address: contractor.address || '',
      specialties: contractor.specialties ? JSON.parse(contractor.specialties) : []
    })
  }

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialtyInput.trim()]
      })
      setSpecialtyInput('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading contractors...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contractor Management</h1>
            <p className="text-slate-600 mt-1">Manage contractors for defect repair and maintenance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Contractor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Contractor</DialogTitle>
                  <DialogDescription>
                    Add a contractor who can be assigned to repair defects
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="ABC Fire Door Services Ltd"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="07123 456789"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 High Street, London, SW1A 1AA"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialties">Specialties</Label>
                    <div className="flex gap-2">
                      <Input
                        id="specialties"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                        placeholder="e.g., Fire Doors, Hinges, Intumescent Seals"
                      />
                      <Button type="button" onClick={addSpecialty} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialty(specialty)}>
                          {specialty} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContractor} className="bg-red-600 hover:bg-red-700">
                    Add Contractor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Contractors ({contractors.length})</CardTitle>
            <CardDescription>
              Contractors who can be assigned to defect repairs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractors.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contractors Yet</h3>
                <p className="text-slate-600 mb-4">
                  Add contractors to assign them to defect repairs
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                  Add Your First Contractor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email / Phone</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.map((contractor) => (
                    <TableRow key={contractor.id}>
                      <TableCell className="font-medium">{contractor.companyName}</TableCell>
                      <TableCell>{contractor.contactName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{contractor.email}</div>
                          <div className="text-slate-500">{contractor.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contractor.specialties ? (
                            JSON.parse(contractor.specialties).map((specialty: string) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{contractor._count.defects} assigned</div>
                          <div className="text-slate-500">{contractor.completedJobs} completed</div>
                          {contractor.averageCompletionDays && (
                            <div className="text-slate-500 text-xs">
                              Avg: {contractor.averageCompletionDays.toFixed(1)} days
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contractor.rating ? (
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium">{contractor.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contractor.isActive ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(contractor)}>
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Contractor</DialogTitle>
                                <DialogDescription>
                                  Update contractor information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-companyName">Company Name *</Label>
                                  <Input
                                    id="edit-companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-contactName">Contact Name *</Label>
                                  <Input
                                    id="edit-contactName"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-email">Email *</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-phone">Phone *</Label>
                                  <Input
                                    id="edit-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-address">Address</Label>
                                  <Textarea
                                    id="edit-address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-specialties">Specialties</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="edit-specialties"
                                      value={specialtyInput}
                                      onChange={(e) => setSpecialtyInput(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                                      placeholder="e.g., Fire Doors, Hinges, Intumescent Seals"
                                    />
                                    <Button type="button" onClick={addSpecialty} variant="outline">
                                      Add
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.specialties.map((specialty) => (
                                      <Badge key={specialty} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialty(specialty)}>
                                        {specialty} ×
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { setEditingContractor(null); resetForm(); }}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateContractor} className="bg-red-600 hover:bg-red-700">
                                  Update Contractor
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(contractor)}
                          >
                            {contractor.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
