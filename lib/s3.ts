import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

/**
 * Generate a presigned URL for uploading a file directly from the browser
 */
export async function generateUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
  return url
}

/**
 * Generate a presigned URL for downloading/viewing a file
 */
export async function generateDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
  return url
}

/**
 * Upload a file directly to S3 from the server
 */
export async function uploadToS3(key: string, file: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType
  })

  await s3Client.send(command)
  return key
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  await s3Client.send(command)
}

/**
 * Generate a unique S3 key for a file
 */
export function generateS3Key(folder: string, fileName: string) {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`
}
