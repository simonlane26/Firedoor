import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// This endpoint should be disabled after initial setup
// Set SETUP_ENABLED=false in environment variables after first use
export async function POST(request: NextRequest) {
  try {
    // Check if setup is allowed
    const setupEnabled = process.env.SETUP_ENABLED !== 'false'

    if (!setupEnabled) {
      return NextResponse.json(
        { error: 'Setup has been disabled' },
        { status: 403 }
      )
    }

    // Check if any users exist
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Users already exist. Setup can only be run on a fresh database.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, password, name, companyName } = body

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, companyName' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Generate subdomain from company name
    const subdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63)

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName,
          subdomain,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'ADMIN',
          tenantId: tenant.id,
          isSuperAdmin: false,
        },
      })

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      tenant: {
        id: result.tenant.id,
        companyName: result.tenant.companyName,
        subdomain: result.tenant.subdomain,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error.message },
      { status: 500 }
    )
  }
}
