import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getTenantFromSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true },
  })

  return user?.tenant || null
}

export async function getUserWithTenant() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true },
  })

  return user
}

// Middleware helper to extract subdomain
export function getSubdomainFromHost(host: string | null): string | null {
  if (!host) return null

  // Remove port if present
  const hostname = host.split(':')[0]

  // Skip localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'default'
  }

  // Extract subdomain (everything before the main domain)
  const parts = hostname.split('.')

  // If we have at least 3 parts (subdomain.domain.tld), return the subdomain
  if (parts.length >= 3) {
    return parts[0]
  }

  // Default subdomain
  return 'default'
}

export async function getTenantBySubdomain(subdomain: string) {
  return await prisma.tenant.findUnique({
    where: { subdomain },
  })
}
