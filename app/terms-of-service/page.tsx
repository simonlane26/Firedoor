import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LegalFooter } from '@/components/legal-footer'

export default function TermsOfServicePage() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-700 mb-4">
                By accessing or using DoorCompliance.co.uk ("Service", "Platform", "we", "our", or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="text-slate-700 mb-4">
                These Terms constitute a legally binding agreement between you (whether personally or on behalf of an entity) and IgnisTech regarding your use of the DoorCompliance.co.uk platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-700 mb-4">
                DoorCompliance.co.uk is a professional fire door inspection management platform designed to help responsible persons, property managers, and fire safety professionals:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Manage fire door inspections in compliance with Fire Safety (England) Regulations 2022</li>
                <li>Track building and door assets</li>
                <li>Record and manage defects</li>
                <li>Generate compliance reports and certificates</li>
                <li>Schedule inspections and receive reminders</li>
                <li>Assign and track contractor repairs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Account Registration</h3>
              <p className="text-slate-700 mb-4">To use the Service, you must:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Account Security</h3>
              <p className="text-slate-700 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Notifying us immediately of any unauthorized access to your account</li>
                <li>Ensuring that you log out from your account at the end of each session</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.3 Account Termination</h3>
              <p className="text-slate-700 mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in conduct that we deem inappropriate or harmful to the Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Subscription and Payment</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Subscription Plans</h3>
              <p className="text-slate-700 mb-4">
                The Service may be offered through various subscription plans with different features and pricing. Details of available plans and pricing are available on our website or upon request.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Subscription fees are billed in advance on a recurring basis (monthly, annually, etc.)</li>
                <li>Payment is due immediately upon subscription or renewal</li>
                <li>You authorize us to charge your payment method for all fees due</li>
                <li>All fees are non-refundable except as required by law or as expressly stated in these Terms</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.3 Automatic Renewal</h3>
              <p className="text-slate-700 mb-4">
                Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings or by contacting support.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.4 Price Changes</h3>
              <p className="text-slate-700 mb-4">
                We reserve the right to modify subscription pricing. We will provide reasonable notice of any price changes, and changes will apply to subsequent billing periods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. User Content and Data</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Your Content</h3>
              <p className="text-slate-700 mb-4">
                You retain ownership of all data, information, photographs, and content you upload to the Service ("User Content"). By uploading User Content, you grant us a limited license to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Store, process, and display your User Content to provide the Service</li>
                <li>Backup and secure your User Content</li>
                <li>Use your User Content to improve and develop the Service (in anonymized and aggregated form only)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Content Responsibility</h3>
              <p className="text-slate-700 mb-4">You represent and warrant that:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>You have the right to upload and use all User Content</li>
                <li>Your User Content does not violate any laws or third-party rights</li>
                <li>Your User Content does not contain malicious code, viruses, or harmful components</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Data Backup</h3>
              <p className="text-slate-700 mb-4">
                While we perform regular backups, you are responsible for maintaining independent copies of critical data. We are not liable for data loss except in cases of gross negligence.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Acceptable Use</h2>
              <p className="text-slate-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Upload malicious code, viruses, or any harmful content</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems (bots, scrapers) without our written permission</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
              <p className="text-slate-700 mb-4">
                For more details, see our <Link href="/acceptable-use-policy" className="text-red-600 hover:underline">Acceptable Use Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">7.1 Our Rights</h3>
              <p className="text-slate-700 mb-4">
                The Service, including all software, code, designs, graphics, and content (excluding User Content), is owned by IgnisTech and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">7.2 Limited License</h3>
              <p className="text-slate-700 mb-4">
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes in accordance with these Terms.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">7.3 Restrictions</h3>
              <p className="text-slate-700 mb-4">You may not:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Copy, modify, or create derivative works of the Service</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Remove or alter any proprietary notices or labels</li>
                <li>Use the Service to develop competing products or services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Service Availability and Support</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.1 Availability</h3>
              <p className="text-slate-700 mb-4">
                We strive to maintain high service availability but do not guarantee uninterrupted or error-free operation. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.2 Maintenance</h3>
              <p className="text-slate-700 mb-4">
                We may perform scheduled maintenance with advance notice when possible. Emergency maintenance may occur without notice.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.3 Support</h3>
              <p className="text-slate-700 mb-4">
                Support is provided via email at <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a>. Response times may vary based on your subscription plan and issue severity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Limitation of Liability</h2>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-amber-900 font-semibold mb-2">IMPORTANT LEGAL NOTICE</p>
                <p className="text-sm text-amber-900">
                  Please read this section carefully as it limits our liability to you.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.1 Disclaimer of Warranties</h3>
              <p className="text-slate-700 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.2 Limitation of Liability</h3>
              <p className="text-slate-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IGNISTECH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE.
              </p>
              <p className="text-slate-700 mb-4">
                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.3 Regulatory Compliance</h3>
              <p className="text-slate-700 mb-4">
                While our Service is designed to assist with Fire Safety (England) Regulations 2022 compliance, YOU ARE SOLELY RESPONSIBLE for ensuring your actual compliance with all applicable laws and regulations. The Service is a tool to assist you; it does not replace professional judgment or legal advice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Indemnification</h2>
              <p className="text-slate-700 mb-4">
                You agree to indemnify, defend, and hold harmless IgnisTech and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Privacy and Data Protection</h2>
              <p className="text-slate-700 mb-4">
                Our collection and use of personal information is governed by our <Link href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</Link>. By using the Service, you consent to our privacy practices as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Modifications to Service and Terms</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">12.1 Service Changes</h3>
              <p className="text-slate-700 mb-4">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. We will provide reasonable notice of material changes when possible.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">12.2 Terms Changes</h3>
              <p className="text-slate-700 mb-4">
                We may modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Termination</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.1 Termination by You</h3>
              <p className="text-slate-700 mb-4">
                You may terminate your account at any time by contacting support or through your account settings. Termination does not relieve you of payment obligations for services already provided.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.2 Termination by Us</h3>
              <p className="text-slate-700 mb-4">
                We may terminate or suspend your access immediately, without notice, for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Violation of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Fraudulent or illegal activity</li>
                <li>At our sole discretion for business reasons</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.3 Effect of Termination</h3>
              <p className="text-slate-700 mb-4">
                Upon termination, your right to use the Service ceases immediately. We may delete your account and User Content, though we may retain certain information as required by law or for legitimate business purposes. You may request a data export before termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Governing Law and Disputes</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">14.1 Governing Law</h3>
              <p className="text-slate-700 mb-4">
                These Terms are governed by the laws of England and Wales, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">14.2 Dispute Resolution</h3>
              <p className="text-slate-700 mb-4">
                Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. General Provisions</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.1 Entire Agreement</h3>
              <p className="text-slate-700 mb-4">
                These Terms, together with our Privacy Policy and other referenced policies, constitute the entire agreement between you and IgnisTech regarding the Service.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.2 Severability</h3>
              <p className="text-slate-700 mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.3 Waiver</h3>
              <p className="text-slate-700 mb-4">
                Our failure to enforce any provision of these Terms does not constitute a waiver of that provision.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.4 Assignment</h3>
              <p className="text-slate-700 mb-4">
                You may not assign or transfer these Terms or your account without our written consent. We may assign these Terms without restriction.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.5 Force Majeure</h3>
              <p className="text-slate-700 mb-4">
                We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, labor disputes, or internet failures.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">16. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 mb-2"><strong>DoorCompliance.co.uk</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:legal@doorcompliance.co.uk" className="text-red-600 hover:underline">legal@doorcompliance.co.uk</a></p>
                <p className="text-slate-700 mb-2">Support: <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a></p>
                <p className="text-slate-700">A service provided by IgnisTech</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <LegalFooter />
    </div>
  )
}
