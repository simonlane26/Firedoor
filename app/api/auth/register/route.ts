import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      companyName,
      phone,
      address
    } = body

    // Validate required fields
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Name, email, password, and company name are required' },
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

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Check if company name is already taken
    const existingTenant = await prisma.tenant.findFirst({
      where: { companyName }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'A company with this name already exists. Please use a unique company name.' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate a subdomain from company name
    const subdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63) // DNS label max length

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate trial end date (14 days from now)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      // Create tenant (organization)
      const tenant = await tx.tenant.create({
        data: {
          companyName,
          subdomain,
          address: address || null,
          subscriptionPlan: 'trial',
          subscriptionStatus: 'active',
          trialEndsAt
        }
      })

      // Create user as admin of the tenant
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'ADMIN',
          tenantId: tenant.id,
          isSuperAdmin: false
        }
      })

      return { tenant, user }
    })

    // Return success (don't include password hash)
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. You can now sign in.',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        },
        tenant: {
          id: result.tenant.id,
          companyName: result.tenant.companyName
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}
