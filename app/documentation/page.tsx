'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  FileText,
  Upload,
  Mail,
  BarChart3,
  Palette,
  Users,
  Settings,
  Download,
  ChevronRight,
  ExternalLink,
  Home,
  Building2,
  DoorOpen,
  ClipboardCheck,
  QrCode,
  Shield,
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  description: string
  icon: any
  file: string
  sections: string[]
}

const documentations: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guide to set up and use the Fire Door Inspector application',
    icon: Home,
    file: 'GETTING_STARTED.md',
    sections: [
      'Initial Setup',
      'Step 1: Set Up Your Tenant',
      'Step 2: Customize Your Branding',
      'Step 3: Import Your Data',
      'Application Features',
      'User Roles',
      'Common Tasks',
      'Troubleshooting',
    ],
  },
  {
    id: 'csv-import-export',
    title: 'CSV Import/Export',
    description: 'Bulk data operations for buildings and fire doors with CSV files',
    icon: Upload,
    file: 'CSV_IMPORT_EXPORT_DOCUMENTATION.md',
    sections: [
      'Features Overview',
      'Import Buildings',
      'Import Fire Doors',
      'Export Data',
      'CSV Templates',
      'Validation Rules',
      'Error Handling',
      'Best Practices',
    ],
  },
  {
    id: 'email-system',
    title: 'Email Reminder System',
    description: 'Automated email reminders for upcoming and overdue inspections',
    icon: Mail,
    file: 'EMAIL_SYSTEM_DOCUMENTATION.md',
    sections: [
      'Email Service Configuration',
      'SMTP Setup',
      'Email Templates',
      'Reminder Scheduling',
      'API Endpoints',
      'Cron Job Integration',
      'Troubleshooting',
    ],
  },
  {
    id: 'reporting',
    title: 'Reports & Analytics',
    description: 'PDF certificates, Excel exports, and visual analytics dashboards',
    icon: BarChart3,
    file: 'REPORTING_SYSTEM_DOCUMENTATION.md',
    sections: [
      'PDF Report Generation',
      'Excel Export Features',
      'Analytics Dashboard',
      'Chart Types',
      'Download Endpoints',
      'API Integration',
      'Performance Considerations',
    ],
  },
  {
    id: 'branding',
    title: 'Custom Branding',
    description: 'Per-tenant logo, colors, and styling customization',
    icon: Palette,
    file: 'BRANDING_SYSTEM_DOCUMENTATION.md',
    sections: [
      'Branding Configuration',
      'Logo Upload',
      'Color Customization',
      'Custom CSS',
      'CSS Variables',
      'Live Preview',
      'Security Considerations',
      'Best Practices',
    ],
  },
  {
    id: 'multi-tenancy',
    title: 'Multi-Tenancy System',
    description: 'Organization isolation and subdomain-based tenant management',
    icon: Users,
    file: 'MULTI_TENANCY_IMPLEMENTATION.md',
    sections: [
      'Tenant Architecture',
      'Subdomain Routing',
      'Data Isolation',
      'User Management',
      'Role-Based Access',
      'Tenant Settings',
      'Security Features',
    ],
  },
]

const quickLinks = [
  { title: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-600' },
  { title: 'Buildings', href: '/buildings', icon: Building2, color: 'text-green-600' },
  { title: 'Fire Doors', href: '/doors', icon: DoorOpen, color: 'text-purple-600' },
  { title: 'Inspections', href: '/inspections', icon: ClipboardCheck, color: 'text-orange-600' },
  { title: 'QR Codes', href: '/qr-codes', icon: QrCode, color: 'text-indigo-600' },
  { title: 'Reports', href: '/reports', icon: BarChart3, color: 'text-red-600' },
  { title: 'CSV Import/Export', href: '/csv', icon: Upload, color: 'text-teal-600' },
  { title: 'Golden Thread Compliance', href: '/golden-thread', icon: Shield, color: 'text-emerald-600' },
  { title: 'Settings', href: '/settings/tenant', icon: Settings, color: 'text-gray-600' },
]

export default function DocumentationPage() {
  const { data: session } = useSession()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  const handleDownload = (filename: string) => {
    // Create a link to download the markdown file
    const link = document.createElement('a')
    link.href = `/${filename}`
    link.download = filename
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{session?.user.name}</span>
              <Badge variant="outline">{session?.user.role}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Documentation</h1>
              <p className="text-slate-600">Fire Door Inspector - Complete System Guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Documentation Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <BookOpen className="h-5 w-5" />
                  Welcome to Fire Door Inspector
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Comprehensive documentation for managing fire door inspections in compliance with
                  Fire Safety (England) Regulations 2022
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Start Here</h4>
                    <p className="text-sm text-blue-700">
                      Read the Getting Started guide to set up your organization and begin using the application
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Explore Features</h4>
                    <p className="text-sm text-blue-700">
                      Browse the feature-specific documentation below for detailed guides and API references
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Need Help?</h4>
                    <p className="text-sm text-blue-700">
                      Check the troubleshooting sections in each guide or review common tasks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentations.map((doc) => {
                const Icon = doc.icon
                return (
                  <Card
                    key={doc.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => setSelectedDoc(doc.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <CardTitle className="text-lg mt-3">{doc.title}</CardTitle>
                      <CardDescription className="text-sm">{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {doc.sections.slice(0, 4).map((section, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="h-1 w-1 rounded-full bg-blue-500" />
                            {section}
                          </div>
                        ))}
                        {doc.sections.length > 4 && (
                          <div className="text-sm text-gray-500 italic">
                            +{doc.sections.length - 4} more sections...
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(doc.file)
                          }}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" className="flex-1">
                          <FileText className="h-3 w-3 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Resources
                </CardTitle>
                <CardDescription>Compliance and reference materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://www.legislation.gov.uk/uksi/2022/547/contents/made"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Fire Safety (England) Regulations 2022
                    </h4>
                    <p className="text-sm text-gray-600">Official UK legislation reference</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>

                <div className="p-3 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Inspection Cycles</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flat Entrance Doors:</span>
                      <span className="font-medium">12 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Communal Doors:</span>
                      <span className="font-medium">3 months</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Technical Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      Next.js 15
                    </span>
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      Prisma
                    </span>
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      NextAuth
                    </span>
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      TypeScript
                    </span>
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      SQLite
                    </span>
                    <span className="px-2 py-1 bg-white border rounded text-xs font-mono">
                      Tailwind CSS
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
                <CardDescription>Navigate to application features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <Icon className={`h-4 w-4 ${link.color}`} />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {link.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600" />
                    </a>
                  )
                })}
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Multi-tenant organization support
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Role-based access control
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  QR code generation & scanning
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Automated email reminders
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  PDF & Excel export
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  CSV bulk import/export
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Custom branding per tenant
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Visual analytics dashboards
                </div>
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                      ADMIN
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Full access - manage settings, users, branding, and all data
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      MANAGER
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Manage buildings, doors, inspections, and reports
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      INSPECTOR
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Record inspections and view assigned doors
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Getting Help */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900">Getting Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-amber-800">
                <p>Need assistance? Here's how to get help:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Check the relevant documentation</li>
                  <li>Review troubleshooting sections</li>
                  <li>Check application logs in terminal</li>
                  <li>Verify your tenant is configured</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
