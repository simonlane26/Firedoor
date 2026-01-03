import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const bucketName = process.env.AWS_S3_BUCKET_NAME

    // Check if all variables are set
    const configStatus = {
      AWS_REGION: region ? '✓ Set' : '✗ Missing',
      AWS_ACCESS_KEY_ID: accessKeyId ? '✓ Set' : '✗ Missing',
      AWS_SECRET_ACCESS_KEY: secretAccessKey ? '✓ Set' : '✗ Missing',
      AWS_S3_BUCKET_NAME: bucketName ? '✓ Set' : '✗ Missing',
    }

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({
        success: false,
        message: 'Missing AWS configuration',
        config: configStatus,
      })
    }

    // Try to create S3 client and upload a test file
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const testKey = `test/connection-test-${Date.now()}.txt`
    const testContent = 'S3 connection test from Railway'

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    })

    await s3Client.send(command)

    return NextResponse.json({
      success: true,
      message: 'S3 connection successful!',
      config: configStatus,
      testFile: `https://${bucketName}.s3.${region}.amazonaws.com/${testKey}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'S3 connection failed',
        error: error.message,
        errorCode: error.Code,
        errorName: error.name,
      },
      { status: 500 }
    )
  }
}
