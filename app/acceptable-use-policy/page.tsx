import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LegalFooter } from '@/components/legal-footer'

export default function AcceptableUsePolicyPage() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Acceptable Use Policy</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                This Acceptable Use Policy ("Policy") governs your use of DoorCompliance.co.uk ("Service", "Platform"). By using the Service, you agree to comply with this Policy and our <Link href="/terms-of-service" className="text-red-600 hover:underline">Terms of Service</Link>.
              </p>
              <p className="text-slate-700 mb-4">
                This Policy is designed to ensure the Service is used responsibly, ethically, and in accordance with applicable laws. Violations of this Policy may result in suspension or termination of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Permitted Uses</h2>
              <p className="text-slate-700 mb-4">The Service is intended for legitimate business purposes, including:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Managing fire door inspection programs in compliance with Fire Safety (England) Regulations 2022</li>
                <li>Recording and tracking building and door asset information</li>
                <li>Documenting inspection findings and defects</li>
                <li>Managing defect remediation and contractor assignments</li>
                <li>Generating compliance reports and certificates</li>
                <li>Scheduling inspections and maintaining compliance records</li>
                <li>Communicating with team members, contractors, and stakeholders regarding fire safety</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Prohibited Uses</h2>
              <p className="text-slate-700 mb-4">You may not use the Service to:</p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Illegal Activities</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Violate any local, national, or international law or regulation</li>
                <li>Engage in fraudulent activities or misrepresentation</li>
                <li>Facilitate money laundering, terrorism financing, or other criminal activities</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Violate privacy rights or data protection laws</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Harmful Content</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Upload malicious code, viruses, trojans, worms, or other harmful software</li>
                <li>Upload content that is defamatory, obscene, offensive, or hateful</li>
                <li>Share content that promotes violence, discrimination, or illegal activities</li>
                <li>Upload excessively large files intended to consume storage or bandwidth</li>
                <li>Upload content containing personal data of individuals without proper consent</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.3 System Abuse</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Attempt to gain unauthorized access to the Service, user accounts, or systems</li>
                <li>Interfere with, disrupt, or impose unreasonable loads on the Service infrastructure</li>
                <li>Bypass security measures, authentication, or access controls</li>
                <li>Probe, scan, or test the vulnerability of the Service without authorization</li>
                <li>Use automated systems (bots, scrapers, scripts) without written permission</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Service</li>
                <li>Use the Service to mine cryptocurrency or perform distributed computing</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.4 Misuse of Service Features</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Create false or misleading inspection records</li>
                <li>Fabricate defects or compliance data</li>
                <li>Alter inspection photographs or evidence in a deceptive manner</li>
                <li>Use the Service to generate fraudulent compliance certificates</li>
                <li>Misrepresent qualifications or credentials of inspectors</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.5 Account Abuse</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Share account credentials with unauthorized individuals</li>
                <li>Create multiple accounts to circumvent restrictions or limits</li>
                <li>Impersonate another person, organization, or entity</li>
                <li>Use another user's account without permission</li>
                <li>Sell, transfer, or sublicense your account to others without authorization</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.6 Commercial Restrictions</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Resell, redistribute, or white-label the Service without authorization</li>
                <li>Use the Service to develop competing products or services</li>
                <li>Extract data for commercial purposes outside your own business operations</li>
                <li>Provide Service access to third parties as a commercial offering</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.7 Communication Abuse</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Send spam, unsolicited communications, or bulk emails through the Service</li>
                <li>Harass, abuse, threaten, or intimidate other users or our staff</li>
                <li>Use the Service to distribute marketing materials unrelated to fire safety</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data and Content Standards</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Accuracy and Integrity</h3>
              <p className="text-slate-700 mb-4">You must:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Provide accurate and truthful information in all inspection records</li>
                <li>Upload genuine photographs and evidence</li>
                <li>Maintain the integrity of compliance data</li>
                <li>Correct any errors or inaccuracies promptly</li>
                <li>Ensure building and door information is current and accurate</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Appropriate Content</h3>
              <p className="text-slate-700 mb-4">Content uploaded to the Service must:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Be relevant to fire door inspections and compliance</li>
                <li>Comply with professional standards and ethics</li>
                <li>Respect confidentiality where required</li>
                <li>Not include personal data beyond what is necessary for the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.3 Data Protection Compliance</h3>
              <p className="text-slate-700 mb-4">When using the Service, you must:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Comply with UK GDPR and Data Protection Act 2018</li>
                <li>Only upload personal data where you have a lawful basis</li>
                <li>Respect individuals' privacy rights</li>
                <li>Ensure you have necessary consents for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Security Obligations</h2>
              <p className="text-slate-700 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Using strong, unique passwords</li>
                <li>Logging out of your account when using shared devices</li>
                <li>Immediately reporting any security breaches or unauthorized access</li>
                <li>Not sharing your account credentials with unauthorized persons</li>
                <li>Ensuring devices used to access the Service have appropriate security measures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Professional Conduct</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">6.1 Professional Standards</h3>
              <p className="text-slate-700 mb-4">
                If you are a certified inspector, fire safety professional, or contractor, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Adhere to your professional code of conduct</li>
                <li>Maintain current certifications and qualifications</li>
                <li>Perform inspections according to applicable standards and regulations</li>
                <li>Provide honest and accurate assessments</li>
                <li>Disclose conflicts of interest where relevant</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">6.2 Regulatory Compliance</h3>
              <p className="text-slate-700 mb-4">
                The Service is designed to assist with Fire Safety (England) Regulations 2022 compliance, but you remain solely responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Understanding and complying with all applicable fire safety regulations</li>
                <li>Ensuring inspections meet regulatory requirements</li>
                <li>Taking appropriate action on identified defects</li>
                <li>Maintaining compliance with inspection frequency requirements</li>
                <li>Keeping authorities informed as required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Resource Usage</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">7.1 Fair Use</h3>
              <p className="text-slate-700 mb-4">You must use the Service resources fairly and reasonably:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Adhere to storage limits specified in your subscription plan</li>
                <li>Use bandwidth and API calls reasonably</li>
                <li>Avoid excessive automated requests or bulk operations</li>
                <li>Optimize file uploads (compress images, use appropriate formats)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">7.2 Quota Limits</h3>
              <p className="text-slate-700 mb-4">
                We may impose reasonable limits on usage to ensure fair access for all users. These may include limits on:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Number of buildings, doors, or inspections per account</li>
                <li>File upload sizes and total storage</li>
                <li>Number of users per tenant organization</li>
                <li>API request rates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Monitoring and Enforcement</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.1 Monitoring</h3>
              <p className="text-slate-700 mb-4">
                We reserve the right to monitor use of the Service to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Ensure compliance with this Policy and our Terms of Service</li>
                <li>Detect and prevent security threats or abuse</li>
                <li>Investigate suspected violations</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.2 Enforcement Actions</h3>
              <p className="text-slate-700 mb-4">
                If we determine that you have violated this Policy, we may take the following actions:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Warning:</strong> Issue a formal warning for minor or first-time violations</li>
                <li><strong>Content Removal:</strong> Remove prohibited content from the Service</li>
                <li><strong>Feature Restriction:</strong> Limit access to certain features</li>
                <li><strong>Account Suspension:</strong> Temporarily suspend your account</li>
                <li><strong>Account Termination:</strong> Permanently terminate your account</li>
                <li><strong>Legal Action:</strong> Pursue legal remedies for serious violations</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">8.3 Reporting Violations</h3>
              <p className="text-slate-700 mb-4">
                If you become aware of any violations of this Policy, please report them to:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-slate-700">
                  Email: <a href="mailto:abuse@doorcompliance.co.uk" className="text-red-600 hover:underline">abuse@doorcompliance.co.uk</a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Consequences of Violations</h2>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-900 font-semibold mb-2">IMPORTANT NOTICE</p>
                <p className="text-sm text-red-900">
                  Violations of this Policy may have serious consequences including account termination, loss of data, legal liability, and potential criminal prosecution for illegal activities.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.1 Service Consequences</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Immediate termination of account without refund</li>
                <li>Loss of access to data and content</li>
                <li>Prohibition from creating new accounts</li>
                <li>Reporting to relevant authorities</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.2 Legal Consequences</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Legal action for damages and recovery of costs</li>
                <li>Cooperation with law enforcement investigations</li>
                <li>Civil or criminal prosecution for illegal activities</li>
                <li>Professional disciplinary action if applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Appeals</h2>
              <p className="text-slate-700 mb-4">
                If your account has been suspended or terminated for alleged Policy violations, you may appeal by contacting:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-slate-700">
                  Email: <a href="mailto:appeals@doorcompliance.co.uk" className="text-red-600 hover:underline">appeals@doorcompliance.co.uk</a>
                </p>
              </div>
              <p className="text-slate-700 mb-4">
                Include your account details and explanation in your appeal. We will review appeals within 10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Acceptable Use Policy from time to time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the updated Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Related Policies</h2>
              <p className="text-slate-700 mb-4">This Policy should be read in conjunction with:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><Link href="/terms-of-service" className="text-red-600 hover:underline">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-red-600 hover:underline">Cookie Policy</Link></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about this Acceptable Use Policy, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 mb-2"><strong>DoorCompliance.co.uk</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:legal@doorcompliance.co.uk" className="text-red-600 hover:underline">legal@doorcompliance.co.uk</a></p>
                <p className="text-slate-700 mb-2">Support: <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a></p>
                <p className="text-slate-700 mb-2">Abuse Reports: <a href="mailto:abuse@doorcompliance.co.uk" className="text-red-600 hover:underline">abuse@doorcompliance.co.uk</a></p>
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
