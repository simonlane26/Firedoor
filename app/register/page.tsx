'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LegalFooter } from '@/components/legal-footer'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          phone: formData.phone,
          address: formData.address
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Success
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="h-16 w-16 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-2">
          DoorCompliance.co.uk
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Create your account to get started
        </p>
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-4 pb-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Register your organization to start managing fire door inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Account created successfully! Redirecting to login...
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold text-slate-900">Company Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="Acme Property Management Ltd"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-slate-500">
                        This will be your organization name in the system
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="020 1234 5678"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Company Address</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 High Street, London, UK"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="text-xs text-slate-600">
                      By creating an account, you agree to our{' '}
                      <Link href="/terms-of-service" className="text-red-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy-policy" className="text-red-600 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-slate-600">
                      Already have an account?{' '}
                      <Link href="/login" className="text-red-600 hover:underline font-semibold">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Your account will be created as an Administrator with full access to manage your organization.
            </p>
          </div>
        </div>
      </div>

      <LegalFooter />
    </div>
  )
}
