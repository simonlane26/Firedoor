import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LegalFooter } from '@/components/legal-footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/login">
              <Button variant="ghost" className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                Welcome to DoorCompliance.co.uk ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fire door inspection management platform.
              </p>
              <p className="text-slate-700 mb-4">
                This policy applies to all information collected through our service and any related services, sales, marketing, or events (collectively, the "Service").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Personal Information</h3>
              <p className="text-slate-700 mb-4">We collect personal information that you provide to us, including:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials (username and password)</li>
                <li>Company information (company name, address)</li>
                <li>Professional details (job title, role)</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2 Building and Inspection Data</h3>
              <p className="text-slate-700 mb-4">When using our Service, you may provide:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Building information (addresses, property details, floor plans)</li>
                <li>Fire door details (locations, specifications, installation dates)</li>
                <li>Inspection records (findings, photographs, defects identified)</li>
                <li>Defect management data (repair records, contractor information)</li>
                <li>Uploaded files and photographs</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.3 Automatically Collected Information</h3>
              <p className="text-slate-700 mb-4">We automatically collect certain information when you visit, use, or navigate the Service:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Log and usage data (IP address, browser type, operating system)</li>
                <li>Device information (device type, unique device identifiers)</li>
                <li>Usage patterns (pages visited, features used, time spent)</li>
                <li>Location data (derived from IP address)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our fire door inspection management platform</li>
                <li><strong>Account Management:</strong> To create and manage your user account</li>
                <li><strong>Communication:</strong> To send administrative information, updates, and service notifications</li>
                <li><strong>Compliance:</strong> To help you meet Fire Safety (England) Regulations 2022 requirements</li>
                <li><strong>Reminders:</strong> To send inspection deadline reminders and compliance alerts</li>
                <li><strong>Reporting:</strong> To generate inspection reports and compliance certificates</li>
                <li><strong>Support:</strong> To respond to your inquiries and provide customer support</li>
                <li><strong>Security:</strong> To monitor and protect against security threats and fraudulent activity</li>
                <li><strong>Analytics:</strong> To understand usage patterns and improve our Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-slate-700 mb-4">If you are located in the European Economic Area (EEA) or United Kingdom, our legal basis for processing your personal information includes:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Contract Performance:</strong> Processing necessary to perform our contract with you</li>
                <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests</li>
                <li><strong>Legal Obligation:</strong> Processing necessary to comply with legal requirements</li>
                <li><strong>Consent:</strong> Where you have given us explicit consent to process your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 We Do Not Sell Your Information</h3>
              <p className="text-slate-700 mb-4">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Service Providers</h3>
              <p className="text-slate-700 mb-4">We may share your information with trusted third-party service providers who assist us in:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Cloud hosting and data storage (AWS S3)</li>
                <li>Database services (Neon PostgreSQL)</li>
                <li>Email delivery services</li>
                <li>Payment processing</li>
                <li>Analytics and monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Legal Requirements</h3>
              <p className="text-slate-700 mb-4">We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Legal proceedings or court orders</li>
                <li>Government or regulatory requests</li>
                <li>Enforcement of our terms and policies</li>
                <li>Protection of our rights, property, or safety</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.4 Business Transfers</h3>
              <p className="text-slate-700 mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Data Security</h2>
              <p className="text-slate-700 mb-4">We implement appropriate technical and organizational security measures to protect your information:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                <li>Secure authentication (bcrypt password hashing)</li>
                <li>Access controls and role-based permissions</li>
                <li>Regular security assessments and updates</li>
                <li>Secure cloud infrastructure (AWS)</li>
                <li>Database backups and disaster recovery</li>
              </ul>
              <p className="text-slate-700 mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data Retention</h2>
              <p className="text-slate-700 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-slate-700 mb-4">Specifically:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period thereafter</li>
                <li><strong>Inspection Records:</strong> Retained in accordance with Fire Safety (England) Regulations 2022 (typically 5+ years)</li>
                <li><strong>Financial Records:</strong> Retained for tax and accounting purposes (typically 7 years)</li>
                <li><strong>Marketing Communications:</strong> Until you unsubscribe or opt-out</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.1 Under GDPR (UK/EEA)</h3>
              <p className="text-slate-700 mb-4">If you are located in the UK or EEA, you have the following rights:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Right of Access:</strong> Request copies of your personal information</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your information ("right to be forgotten")</li>
                <li><strong>Right to Restriction:</strong> Request limitation of processing</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.2 Exercising Your Rights</h3>
              <p className="text-slate-700 mb-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@doorcompliance.co.uk" className="text-red-600 hover:underline">privacy@doorcompliance.co.uk</a>. We will respond to your request within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our Service. For detailed information about the cookies we use and your choices, please see our <Link href="/cookie-policy" className="text-red-600 hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Third-Party Links</h2>
              <p className="text-slate-700 mb-4">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Children's Privacy</h2>
              <p className="text-slate-700 mb-4">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. International Data Transfers</h2>
              <p className="text-slate-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 mb-2"><strong>DoorCompliance.co.uk</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:privacy@doorcompliance.co.uk" className="text-red-600 hover:underline">privacy@doorcompliance.co.uk</a></p>
                <p className="text-slate-700 mb-2">Support: <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a></p>
                <p className="text-slate-700">A service provided by IgnisTech</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Supervisory Authority</h2>
              <p className="text-slate-700 mb-4">
                If you are located in the UK or EEA and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.
              </p>
              <p className="text-slate-700 mb-4">
                For the UK: Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">ico.org.uk</a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <LegalFooter />
    </div>
  )
}
