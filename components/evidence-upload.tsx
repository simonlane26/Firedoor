'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, Image, FileCheck, File, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EvidenceUploadProps {
  entityType: 'DOOR' | 'BUILDING' | 'INSPECTION'
  entityId: string
  onUploadComplete?: () => void
}

export function EvidenceUpload({ entityType, entityId, onUploadComplete }: EvidenceUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recordType, setRecordType] = useState<string>('')
  const [description, setDescription] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !recordType) {
      alert('Please select a file and record type')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)
      formData.append('recordType', recordType)
      formData.append('description', description)

      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setSelectedFile(null)
      setRecordType('')
      setDescription('')

      if (onUploadComplete) {
        onUploadComplete()
      }

      alert('Evidence uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload evidence')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <Image className="h-4 w-4" />
      case 'CERTIFICATE':
        return <FileCheck className="h-4 w-4" />
      case 'PDF':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Evidence
        </CardTitle>
        <CardDescription>
          Upload photos, certificates, or documentation related to this {entityType.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recordType">Evidence Type</Label>
          <Select value={recordType} onValueChange={setRecordType}>
            <SelectTrigger>
              <SelectValue placeholder="Select evidence type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHOTO">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Photo
                </div>
              </SelectItem>
              <SelectItem value="PDF">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Document
                </div>
              </SelectItem>
              <SelectItem value="CERTIFICATE">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Certificate
                </div>
              </SelectItem>
              <SelectItem value="REMEDIAL_PROOF">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Remedial Work Proof
                </div>
              </SelectItem>
              <SelectItem value="MANUFACTURER_DOC">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Manufacturer Documentation
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
              {getFileIcon(recordType)}
              <span className="text-sm flex-1">{selectedFile.name}</span>
              <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this evidence..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !recordType || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Evidence'}
        </Button>
      </CardContent>
    </Card>
  )
}
