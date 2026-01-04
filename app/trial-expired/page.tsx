import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, CreditCard, Mail } from 'lucide-react'

export default async function TrialExpiredPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true }
  })

  if (!user || !user.tenant) {
    redirect('/login')
  }

  // If not on trial or trial hasn't expired, redirect to dashboard
  if (user.tenant.subscriptionPlan !== 'trial' ||
      !user.tenant.trialEndsAt ||
      new Date() <= new Date(user.tenant.trialEndsAt)) {
    redirect('/dashboard')
  }

  const trialEndDate = new Date(user.tenant.trialEndsAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <CardTitle className="text-2xl">Trial Period Ended</CardTitle>
          </div>
          <CardDescription>
            Your 14-day free trial ended on {trialEndDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <strong>Access Limited:</strong> Your account has been restricted to view-only mode.
              To continue creating inspections and managing your fire door compliance, please upgrade to a paid plan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">What you've been using:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Complete fire door inspection management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Building Safety Act Golden Thread compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Automated reporting and PDF generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>QR code door verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Immutable audit trail and evidence storage</span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Continue Your Compliance Journey</h3>
            <p className="text-sm text-slate-600 mb-4">
              Choose a plan that fits your needs and continue meeting your Building Safety Act obligations.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-slate-900">£12</div>
                    <div className="text-sm text-slate-600">per door/year</div>
                  </div>
                  <div className="text-sm text-slate-700 space-y-2 mb-4">
                    <div>✓ Unlimited inspections</div>
                    <div>✓ Full compliance features</div>
                    <div>✓ Priority support</div>
                    <div>✓ Regular updates</div>
                  </div>
                  <Link href={`mailto:sales@firedoorchecks.com?subject=Upgrade Request - ${user.tenant.companyName}`}>
                    <Button className="w-full" size="lg">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-blue-600">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                      POPULAR
                    </div>
                    <div className="text-3xl font-bold text-slate-900">£65</div>
                    <div className="text-sm text-slate-600">per inspector/year</div>
                  </div>
                  <div className="text-sm text-slate-700 space-y-2 mb-4">
                    <div>✓ Unlimited doors & buildings</div>
                    <div>✓ Multiple inspectors</div>
                    <div>✓ Advanced reporting</div>
                    <div>✓ Dedicated support</div>
                  </div>
                  <Link href={`mailto:sales@firedoorchecks.com?subject=Enterprise Upgrade - ${user.tenant.companyName}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Get Enterprise Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Need a custom solution? We offer flexible pricing for large organizations.
            </p>
            <Link href="mailto:sales@firedoorchecks.com?subject=Custom Plan Inquiry">
              <Button variant="outline" size="sm">
                Request Custom Quote
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4">
            <Link href="/dashboard">
              <Button variant="ghost">
                View Your Data (Read-Only)
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
