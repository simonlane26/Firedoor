import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateUploadUrl, generateS3Key } from '@/lib/s3'

// POST /api/upload - Generate presigned URL for file upload
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { fileName, contentType, folder } = body

    if (!fileName || !contentType || !folder) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, contentType, folder' },
        { status: 400 }
      )
    }

    // Generate unique S3 key
    const s3Key = generateS3Key(folder, fileName)

    // Generate presigned URL for upload
    const uploadUrl = await generateUploadUrl(s3Key, contentType)

    return NextResponse.json({
      uploadUrl,
      key: s3Key
    })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
