'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Image, FileCheck, File, Download, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface EvidenceRecord {
  id: string
  recordType: string
  fileName: string
  fileSize: number | null
  fileUrl: string
  description: string | null
  createdAt: string
  uploadedByUser: {
    name: string
  }
}

interface EvidenceListProps {
  entityType: 'DOOR' | 'BUILDING' | 'INSPECTION'
  entityId: string
  refreshTrigger?: number
}

export function EvidenceList({ entityType, entityId, refreshTrigger }: EvidenceListProps) {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvidence()
  }, [entityType, entityId, refreshTrigger])

  const fetchEvidence = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/evidence?entityType=${entityType}&entityId=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        setEvidence(data)
      }
    } catch (error) {
      console.error('Error fetching evidence:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) {
      return
    }

    try {
      const response = await fetch(`/api/evidence/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchEvidence()
      } else {
        alert('Failed to delete evidence')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete evidence')
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <Image className="h-5 w-5 text-blue-600" />
      case 'CERTIFICATE':
        return <FileCheck className="h-5 w-5 text-green-600" />
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-600" />
      case 'REMEDIAL_PROOF':
        return <FileCheck className="h-5 w-5 text-purple-600" />
      case 'MANUFACTURER_DOC':
        return <File className="h-5 w-5 text-orange-600" />
      default:
        return <File className="h-5 w-5 text-slate-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      PHOTO: { label: 'Photo', className: 'bg-blue-100 text-blue-800' },
      CERTIFICATE: { label: 'Certificate', className: 'bg-green-100 text-green-800' },
      PDF: { label: 'PDF', className: 'bg-red-100 text-red-800' },
      REMEDIAL_PROOF: { label: 'Remedial Proof', className: 'bg-purple-100 text-purple-800' },
      MANUFACTURER_DOC: { label: 'Manufacturer Doc', className: 'bg-orange-100 text-orange-800' }
    }

    const config = typeMap[type] || { label: type, className: 'bg-slate-100 text-slate-800' }

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Loading evidence records...
        </CardContent>
      </Card>
    )
  }

  if (evidence.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evidence Records</CardTitle>
          <CardDescription>No evidence uploaded yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Records ({evidence.length})</CardTitle>
        <CardDescription>
          Uploaded documentation and media files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {evidence.map((record) => (
            <div
              key={record.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="mt-1">{getFileIcon(record.recordType)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 truncate">
                      {record.fileName}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Uploaded by {record.uploadedByUser.name} on{' '}
                      {format(new Date(record.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(record.recordType)}
                    {record.fileSize && (
                      <Badge variant="outline" className="bg-slate-50">
                        {(record.fileSize / 1024).toFixed(1)} KB
                      </Badge>
                    )}
                  </div>
                </div>

                {record.description && (
                  <p className="text-sm text-slate-600 mt-2 mb-3">
                    {record.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={record.fileUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
