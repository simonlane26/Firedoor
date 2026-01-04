import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Database, Lock, FileCheck, Clock, Building2, CheckCircle2, FileText, Archive } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Golden Thread Compliance | Fire Door Inspector',
  description: 'How our platform meets the Building Safety Act Golden Thread requirements for fire door inspection data management',
}

export default function GoldenThreadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Golden Thread Compliance</h1>
              <p className="text-slate-600">Meeting Building Safety Act Requirements</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Introduction */}
        <div className="mb-12">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-2xl mb-2">Built for Building Safety Act Compliance</CardTitle>
                  <CardDescription className="text-base">
                    Our platform is designed specifically to meet the Golden Thread requirements introduced by the Building Safety Act 2022.
                    We provide a complete, auditable, and immutable record of all fire door inspections and maintenance activities.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* What is the Golden Thread */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What is the Golden Thread?</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-700 mb-4">
                The Golden Thread is a requirement under the Building Safety Act 2022 that mandates the creation and maintenance
                of a complete, accurate, and up-to-date digital record of building information throughout its lifecycle.
              </p>
              <p className="text-slate-700 mb-4">
                For fire safety systems including fire doors, this means maintaining:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Complete records of all inspections, tests, and maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Identification and specifications of all fire doors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Audit trail of all changes and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Evidence of compliance with regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Easily accessible information for residents and regulators</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* How We Meet Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How We Meet Golden Thread Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Storage */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  <CardTitle>Secure Data Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  All inspection data is stored in enterprise-grade PostgreSQL databases with:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Automated daily backups with 30-day retention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Encryption at rest and in transit (TLS 1.3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Geographically distributed redundancy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>99.9% uptime SLA guarantee</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Immutability */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="h-6 w-6 text-purple-600" />
                  <CardTitle>Immutable Audit Trail</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Every inspection and change is permanently recorded:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Inspections cannot be deleted or modified after submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Complete version history of all door registrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Timestamped records with inspector identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Full audit trail accessible for regulatory review</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Evidence Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <FileCheck className="h-6 w-6 text-green-600" />
                  <CardTitle>Evidence & Documentation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Comprehensive evidence capture and management:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Photo evidence attached to every inspection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Certification uploads with permanent storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>PDF reports generated with digital signatures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>QR codes for instant door verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Retention & Access */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <CardTitle>Data Retention & Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Meeting regulatory retention requirements:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Indefinite retention of all inspection records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Instant access to complete historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Export capabilities for regulatory submissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Role-based access control for data security</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Regulatory Compliance */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Regulatory Compliance Features</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Inspection Standards</h3>
                  <p className="text-sm text-slate-600">
                    Compliant with BS 9999, BS 8214, and Building Regulations Approved Document B
                  </p>
                </div>
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Building Information</h3>
                  <p className="text-sm text-slate-600">
                    Complete building profiles with type classification and responsible person details
                  </p>
                </div>
                <div className="text-center">
                  <Archive className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Safety Case Evidence</h3>
                  <p className="text-sm text-slate-600">
                    Generate comprehensive reports for safety case submissions and BSR reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Technical Architecture</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Database Layer
                  </h3>
                  <p className="text-slate-700 mb-2">
                    PostgreSQL relational database with strict schema enforcement and foreign key constraints ensures data integrity.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1 ml-6">
                    <li>• Normalized data structure prevents duplication and inconsistencies</li>
                    <li>• Automatic timestamp tracking (createdAt, updatedAt) on all records</li>
                    <li>• Cascade delete protection on critical entities</li>
                    <li>• Transaction-based operations for data consistency</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    Security Measures
                  </h3>
                  <p className="text-slate-700 mb-2">
                    Multi-layered security approach protecting your Golden Thread data:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1 ml-6">
                    <li>• Multi-tenant architecture with complete data isolation</li>
                    <li>• Role-based access control (RBAC) with granular permissions</li>
                    <li>• Industry-standard authentication (NextAuth.js)</li>
                    <li>• API rate limiting and DDoS protection</li>
                    <li>• Regular security audits and penetration testing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    File Storage
                  </h3>
                  <p className="text-slate-700 mb-2">
                    Enterprise-grade object storage for photos and documents:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1 ml-6">
                    <li>• AWS S3 with 99.999999999% durability guarantee</li>
                    <li>• Automatic versioning and deletion protection</li>
                    <li>• Cross-region replication for disaster recovery</li>
                    <li>• Secure presigned URLs with expiration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Audit Trail Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Audit Trail Guarantee</h2>
          <Card className="border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-slate-700">
                  <strong>We guarantee a complete and immutable audit trail of all activities:</strong>
                </p>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Every inspection record includes:</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>✓ Inspector name and credentials</li>
                    <li>✓ Exact date and time of inspection</li>
                    <li>✓ Door identification and location</li>
                    <li>✓ Complete inspection checklist results</li>
                    <li>✓ Photographic evidence</li>
                    <li>✓ Compliance outcome and remedial actions</li>
                    <li>✓ Unique inspection reference number</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Immutability measures:</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>✓ Database-level constraints prevent deletion of inspection records</li>
                    <li>✓ Modification attempts are logged and rejected</li>
                    <li>✓ Soft-delete only for door registrations (preserves history)</li>
                    <li>✓ All changes tracked with timestamps and user attribution</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Regulatory Assurance:</strong> Our audit trail meets and exceeds the requirements set out in the
                    Building Safety Act 2022 and associated guidance. Records are maintained for the lifetime of the building
                    and beyond, ensuring compliance with potential future retention requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Retention Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Data Retention Policy</h2>
          <Card>
            <CardContent className="pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Data Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Retention Period</th>
                    <th className="text-left py-3 px-4 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Inspection Records</td>
                    <td className="py-3 px-4"><Badge>Indefinite</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Golden Thread compliance, building history</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Door Registrations</td>
                    <td className="py-3 px-4"><Badge>Indefinite</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Asset register, compliance evidence</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Photographic Evidence</td>
                    <td className="py-3 px-4"><Badge>Indefinite</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Inspection verification, defect proof</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Building Information</td>
                    <td className="py-3 px-4"><Badge>Indefinite</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Responsible person records, classification</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Certifications</td>
                    <td className="py-3 px-4"><Badge>Indefinite</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Installation evidence, compliance proof</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Database Backups</td>
                    <td className="py-3 px-4"><Badge variant="outline">30 days rolling</Badge></td>
                    <td className="py-3 px-4 text-sm text-slate-600">Disaster recovery, data protection</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-slate-600 mt-4">
                * All data is retained indefinitely unless explicitly deleted by the tenant administrator. Even when deleted,
                soft-delete mechanisms preserve data for audit purposes while removing it from active use.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Housing Associations Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purpose-Built for Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Unlike generic inspection tools, our platform was designed from the ground up to meet Building Safety Act
                  requirements. Every feature supports your Golden Thread obligations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demonstrate Due Diligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Choosing a purpose-built Golden Thread platform demonstrates to regulators that you take your
                  responsibilities seriously and have invested in proper compliance infrastructure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Future-Proof Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Our technical architecture is designed to adapt to evolving regulations. We monitor regulatory changes
                  and update the platform to maintain compliance automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transparent & Auditable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Everything is transparent and auditable. You can export all data at any time, and regulators can verify
                  the integrity of your records through our comprehensive audit trails.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-4">Ready to Meet Your Golden Thread Obligations?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join housing associations across the UK who trust our platform for Building Safety Act compliance.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="mailto:sales@firedoorchecks.com?subject=Golden Thread Compliance Inquiry">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-700">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>
            Last updated: January 2026 | This page reflects our current compliance measures and may be updated to reflect
            evolving regulations and best practices.
          </p>
        </div>
      </div>
    </div>
  )
}
