import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LegalFooter } from '@/components/legal-footer'

export default function CookiePolicyPage() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Cookie Policy</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-slate-700 mb-4">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-slate-700 mb-4">
                Cookies help us understand how you use DoorCompliance.co.uk, remember your preferences, and improve your experience on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-slate-700 mb-4">DoorCompliance.co.uk uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Authentication:</strong> To keep you signed in and maintain your session</li>
                <li><strong>Security:</strong> To protect against fraudulent activity and enhance security</li>
                <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                <li><strong>Performance:</strong> To understand how you use our service and identify areas for improvement</li>
                <li><strong>Functionality:</strong> To provide features like multi-tenant access and role-based permissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Strictly Necessary Cookies</h3>
              <p className="text-slate-700 mb-4">
                These cookies are essential for the operation of our platform. They enable core functionality such as security, authentication, and access to secure areas. The platform cannot function properly without these cookies.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-slate-900">Cookie Name</th>
                      <th className="text-left py-2 px-2 text-slate-900">Purpose</th>
                      <th className="text-left py-2 px-2 text-slate-900">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-b">
                      <td className="py-2 px-2 font-mono text-xs">next-auth.session-token</td>
                      <td className="py-2 px-2">Maintains your authenticated session</td>
                      <td className="py-2 px-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 font-mono text-xs">next-auth.csrf-token</td>
                      <td className="py-2 px-2">Prevents cross-site request forgery attacks</td>
                      <td className="py-2 px-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-mono text-xs">next-auth.callback-url</td>
                      <td className="py-2 px-2">Manages authentication redirects</td>
                      <td className="py-2 px-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Functionality Cookies</h3>
              <p className="text-slate-700 mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and customization options.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-slate-900">Cookie Name</th>
                      <th className="text-left py-2 px-2 text-slate-900">Purpose</th>
                      <th className="text-left py-2 px-2 text-slate-900">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-b">
                      <td className="py-2 px-2 font-mono text-xs">tenant-preference</td>
                      <td className="py-2 px-2">Remembers your tenant/organization selection</td>
                      <td className="py-2 px-2">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-mono text-xs">user-preferences</td>
                      <td className="py-2 px-2">Stores your dashboard and filter preferences</td>
                      <td className="py-2 px-2">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.3 Performance and Analytics Cookies</h3>
              <p className="text-slate-700 mb-4">
                These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve the service.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-600 italic">
                  Note: We currently do not use third-party analytics services. Any analytics are performed internally with anonymized data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Third-Party Cookies</h2>
              <p className="text-slate-700 mb-4">
                We minimize the use of third-party cookies. However, some trusted third-party services we use may set their own cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>AWS CloudFront:</strong> For content delivery and performance optimization</li>
                <li><strong>Payment Processors:</strong> If you make payments through our platform (secure payment processing only)</li>
              </ul>
              <p className="text-slate-700 mb-4">
                These third parties have their own privacy and cookie policies, which we encourage you to review.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Managing Cookies</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Browser Settings</h3>
              <p className="text-slate-700 mb-4">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>View what cookies are stored on your device</li>
                <li>Delete some or all cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Delete cookies when you close your browser</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Browser-Specific Instructions</h3>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <ul className="space-y-2 text-sm text-slate-700">
                  <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Impact of Blocking Cookies</h3>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> If you block or delete cookies, some features of DoorCompliance.co.uk may not function properly. Specifically:
                </p>
                <ul className="list-disc pl-6 mt-2 text-sm text-amber-900 space-y-1">
                  <li>You may not be able to sign in or maintain your session</li>
                  <li>Your preferences and settings may not be saved</li>
                  <li>Some functionality may be degraded or unavailable</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Session Storage and Local Storage</h2>
              <p className="text-slate-700 mb-4">
                In addition to cookies, we may use browser session storage and local storage to improve your experience:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Session Storage:</strong> Temporarily stores data during your browsing session (cleared when you close the tab)</li>
                <li><strong>Local Storage:</strong> Stores data locally on your device to remember preferences across sessions</li>
              </ul>
              <p className="text-slate-700 mb-4">
                This data is stored locally on your device and is not transmitted to our servers except when necessary for functionality (e.g., saving your preferences).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Updates to This Cookie Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Your Consent</h2>
              <p className="text-slate-700 mb-4">
                By using DoorCompliance.co.uk, you consent to our use of cookies as described in this Cookie Policy. If you do not agree to our use of cookies, please adjust your browser settings or discontinue use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. More Information</h2>
              <p className="text-slate-700 mb-4">
                For more information about how we handle your personal data, please see our <Link href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</Link>.
              </p>
              <p className="text-slate-700 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 mb-2"><strong>DoorCompliance.co.uk</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:privacy@doorcompliance.co.uk" className="text-red-600 hover:underline">privacy@doorcompliance.co.uk</a></p>
                <p className="text-slate-700 mb-2">Support: <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a></p>
                <p className="text-slate-700">A service provided by IgnisTech</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Useful Links</h2>
              <p className="text-slate-700 mb-4">For more information about cookies and how to manage them:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">AboutCookies.org</a> - Information about cookies</li>
                <li><a href="https://ico.org.uk/for-the-public/online/cookies" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">ICO Cookies Guidance</a> - UK Information Commissioner's Office guidance</li>
                <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">AllAboutCookies.org</a> - Comprehensive cookie information</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <LegalFooter />
    </div>
  )
}
