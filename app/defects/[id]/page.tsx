'use client'

import { use, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertTriangle,
  Building2,
  DoorClosed,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  Upload,
  X,
  Save,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Contractor {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
}

interface Defect {
  id: string
  ticketNumber: string
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR'
  status: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  description: string
  detectedDate: string
  targetCompletionDate?: string
  repairCompletedDate?: string
  repairNotes?: string
  repairCost?: number
  proofOfFixUrls?: string
  closureNotes?: string
  closedDate?: string
  door: {
    id: string
    doorNumber: string
    location: string
    building: {
      id: string
      name: string
      address: string
    }
  }
  inspection: {
    id: string
    inspectionDate: string
    inspector: {
      name: string
      email: string
    }
  }
  assignedContractor?: Contractor
}

const severityColors = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  MAJOR: 'bg-orange-100 text-orange-800 border-orange-300',
  MINOR: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

const priorityColors = {
  URGENT: 'destructive',
  HIGH: 'destructive',
  MEDIUM: 'default',
  LOW: 'secondary'
}

const statusColors = {
  OPEN: 'bg-slate-100 text-slate-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  AWAITING_PARTS: 'bg-purple-100 text-purple-800',
  REPAIR_COMPLETED: 'bg-green-100 text-green-800',
  REINSPECTION_PASSED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function DefectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Unwrap params using React.use()
  const { id } = use(params)

  const [defect, setDefect] = useState<Defect | null>(null)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit states
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedContractorId, setAssignedContractorId] = useState<string>('')
  const [targetCompletionDate, setTargetCompletionDate] = useState('')
  const [repairNotes, setRepairNotes] = useState('')
  const [repairCost, setRepairCost] = useState('')
  const [closureNotes, setClosureNotes] = useState('')
  const [proofOfFixFiles, setProofOfFixFiles] = useState<File[]>([])

  useEffect(() => {
    fetchDefect()
    fetchContractors()
  }, [id])

  const fetchDefect = async () => {
    try {
      const response = await fetch(`/api/defects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDefect(data)
        setStatus(data.status)
        setPriority(data.priority)
        setAssignedContractorId(data.assignedContractor?.id || '')
        setTargetCompletionDate(data.targetCompletionDate?.split('T')[0] || '')
        setRepairNotes(data.repairNotes || '')
        setRepairCost(data.repairCost?.toString() || '')
        setClosureNotes(data.closureNotes || '')
      }
    } catch (error) {
      console.error('Error fetching defect:', error)
      toast({
        title: 'Error',
        description: 'Failed to load defect details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/contractors?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setContractors(data)
      }
    } catch (error) {
      console.error('Error fetching contractors:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData: any = {
        status,
        priority
      }

      if (assignedContractorId) {
        updateData.assignedContractorId = assignedContractorId
      }

      if (targetCompletionDate) {
        updateData.targetCompletionDate = targetCompletionDate
      }

      if (repairNotes) {
        updateData.repairNotes = repairNotes
      }

      if (repairCost) {
        updateData.repairCost = parseFloat(repairCost)
      }

      if (closureNotes) {
        updateData.closureNotes = closureNotes
      }

      // If status is being set to REPAIR_COMPLETED, add completion date
      if (status === 'REPAIR_COMPLETED' && defect?.status !== 'REPAIR_COMPLETED') {
        updateData.repairCompletedDate = new Date().toISOString()
      }

      // If status is being set to CLOSED, add closure date
      if (status === 'CLOSED' && defect?.status !== 'CLOSED') {
        updateData.closedDate = new Date().toISOString()
      }

      const response = await fetch(`/api/defects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Defect updated successfully'
        })
        fetchDefect()
      } else {
        throw new Error('Failed to update defect')
      }
    } catch (error) {
      console.error('Error updating defect:', error)
      toast({
        title: 'Error',
        description: 'Failed to update defect',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUploadProofOfFix = async () => {
    if (proofOfFixFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const uploadedUrls: string[] = []

      // Upload each file to S3
      for (const file of proofOfFixFiles) {
        // Get presigned upload URL
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folder: 'defects/proof-of-fix'
          })
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { uploadUrl, key } = await uploadResponse.json()

        // Upload file to S3 using presigned URL
        const s3Response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        })

        if (!s3Response.ok) {
          throw new Error('Failed to upload file to S3')
        }

        uploadedUrls.push(key)
      }

      // Update defect with proof of fix URLs
      const existingUrls = defect?.proofOfFixUrls ? JSON.parse(defect.proofOfFixUrls) : []
      const allUrls = [...existingUrls, ...uploadedUrls]

      const updateResponse = await fetch(`/api/defects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proofOfFixUrls: allUrls
        })
      })

      if (updateResponse.ok) {
        toast({
          title: 'Success',
          description: `${proofOfFixFiles.length} file(s) uploaded successfully`
        })
        setProofOfFixFiles([])
        fetchDefect()
      } else {
        throw new Error('Failed to update defect')
      }
    } catch (error) {
      console.error('Error uploading proof of fix:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading defect details...</p>
        </div>
      </div>
    )
  }

  if (!defect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Defect Not Found</h2>
            <p className="text-slate-600 mb-4">The defect you're looking for doesn't exist.</p>
            <Link href="/defects">
              <Button>Back to Defects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/defects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Defects
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-2xl font-bold text-slate-900">{defect.ticketNumber}</h1>
            <Badge className={severityColors[defect.severity]}>
              {defect.severity}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session?.user.name}</span>
            <Badge variant="outline">{session?.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Defect Details */}
            <Card>
              <CardHeader>
                <CardTitle>Defect Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Description</Label>
                  <p className="mt-1 text-slate-900">{defect.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Category</Label>
                    <p className="mt-1 text-slate-900">{defect.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Detected Date</Label>
                    <p className="mt-1 text-slate-900">
                      {new Date(defect.detectedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Location</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="h-4 w-4" />
                      <span>{defect.door.building.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <DoorClosed className="h-4 w-4" />
                      <span>Door {defect.door.doorNumber} - {defect.door.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 ml-6">{defect.door.building.address}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Inspection Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <User className="h-4 w-4" />
                      <span>Inspector: {defect.inspection.inspector.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4" />
                      <span>Inspection Date: {new Date(defect.inspection.inspectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>Defect Management</CardTitle>
                <CardDescription>Update status, assign contractor, and manage repairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="AWAITING_PARTS">Awaiting Parts</SelectItem>
                        <SelectItem value="REPAIR_COMPLETED">Repair Completed</SelectItem>
                        <SelectItem value="REINSPECTION_PASSED">Reinspection Passed</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Assign Contractor</Label>
                  <Select value={assignedContractorId || "unassigned"} onValueChange={(value) => setAssignedContractorId(value === "unassigned" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contractor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">None</SelectItem>
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>
                          {contractor.companyName} - {contractor.contactName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Completion Date</Label>
                  <Input
                    type="date"
                    value={targetCompletionDate}
                    onChange={(e) => setTargetCompletionDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Repair Notes</Label>
                  <Textarea
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    placeholder="Enter notes about the repair work..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Repair Cost (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {(status === 'CLOSED' || status === 'CANCELLED') && (
                  <div>
                    <Label>Closure Notes</Label>
                    <Textarea
                      value={closureNotes}
                      onChange={(e) => setClosureNotes(e.target.value)}
                      placeholder="Enter notes about closing this defect..."
                      rows={3}
                    />
                  </div>
                )}

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Proof of Fix Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Proof of Fix</CardTitle>
                <CardDescription>Upload photos showing completed repairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Drag and drop files here or click to browse</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setProofOfFixFiles(Array.from(e.target.files))
                        }
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>

                  {proofOfFixFiles.length > 0 && (
                    <div>
                      <Label>Selected Files</Label>
                      <div className="mt-2 space-y-2">
                        {proofOfFixFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setProofOfFixFiles(proofOfFixFiles.filter((_, i) => i !== index))
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleUploadProofOfFix} className="w-full mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  )}

                  {/* Display existing proof of fix photos */}
                  {defect?.proofOfFixUrls && JSON.parse(defect.proofOfFixUrls).length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <Label className="text-lg font-semibold">Uploaded Proof of Fix Photos</Label>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {JSON.parse(defect.proofOfFixUrls).map((key: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={`https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`}
                              alt={`Proof of fix ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-slate-200"
                            />
                            <a
                              href={`https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center rounded-lg"
                            >
                              <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                View Full Size
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={statusColors[defect.status as keyof typeof statusColors] + ' w-full justify-center py-2'}>
                  {defect.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant={priorityColors[defect.priority] as any} className="w-full justify-center py-2">
                  {defect.priority} Priority
                </Badge>
              </CardContent>
            </Card>

            {defect.assignedContractor && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Contractor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm text-slate-600">Company</Label>
                    <p className="font-medium">{defect.assignedContractor.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Contact</Label>
                    <p>{defect.assignedContractor.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Email</Label>
                    <p className="text-sm">{defect.assignedContractor.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Phone</Label>
                    <p className="text-sm">{defect.assignedContractor.phone}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {defect.targetCompletionDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm text-slate-600">Target Completion</Label>
                    <p className="font-medium">{new Date(defect.targetCompletionDate).toLocaleDateString()}</p>
                  </div>
                  {defect.repairCompletedDate && (
                    <div>
                      <Label className="text-sm text-slate-600">Repair Completed</Label>
                      <p className="font-medium">{new Date(defect.repairCompletedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {defect.closedDate && (
                    <div>
                      <Label className="text-sm text-slate-600">Closed</Label>
                      <p className="font-medium">{new Date(defect.closedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/buildings/${defect.door.building.id}`}>
                  <Button variant="outline" className="w-full">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Building
                  </Button>
                </Link>
                <Link href={`/doors/${defect.door.id}`}>
                  <Button variant="outline" className="w-full">
                    <DoorClosed className="h-4 w-4 mr-2" />
                    View Door
                  </Button>
                </Link>
                <Link href={`/inspections/${defect.inspection.id}`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Inspection
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
