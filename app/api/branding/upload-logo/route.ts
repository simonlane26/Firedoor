import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can upload logos
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'favicon'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || (type !== 'logo' && type !== 'favicon')) {
      return NextResponse.json({ error: 'Invalid type. Must be "logo" or "favicon"' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, SVG, and ICO files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      )
    }

    // Generate filename
    const extension = file.name.split('.').pop()
    const filename = `${type}-${Date.now()}.${extension}`
    const s3Key = `branding/${user.tenant.id}/${filename}`

    // Upload to S3
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await uploadToS3(s3Key, buffer, file.type)

    // Generate public URL (S3 bucket URL)
    const region = process.env.AWS_REGION || 'eu-west-2'
    const bucketName = process.env.AWS_S3_BUCKET_NAME
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`

    // Update tenant with new URL
    const updateData = type === 'logo'
      ? { logoUrl: publicUrl }
      : { faviconUrl: publicUrl }

    await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type,
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
