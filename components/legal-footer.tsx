import Link from 'next/link'

export function LegalFooter() {
  return (
    <footer className="border-t bg-slate-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">DoorCompliance.co.uk</h3>
            <p className="text-sm text-slate-600 mb-2">
              Professional Fire Door Compliance Management
            </p>
            <p className="text-xs text-slate-500">
              Compliant with Fire Safety (England) Regulations 2022
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-slate-600 hover:text-red-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-slate-600 hover:text-red-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-slate-600 hover:text-red-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use-policy" className="text-slate-600 hover:text-red-600 transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Contact</h3>
            <p className="text-sm text-slate-600 mb-2">
              Need help or have questions?
            </p>
            <p className="text-sm text-slate-600">
              Email: <a href="mailto:support@doorcompliance.co.uk" className="text-red-600 hover:underline">support@doorcompliance.co.uk</a>
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} DoorCompliance.co.uk. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 mt-2">An IgnisTech Development</p>
        </div>
      </div>
    </footer>
  )
}
