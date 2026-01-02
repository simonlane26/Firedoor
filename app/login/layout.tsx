import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Fire Door Inspection Management',
  description: 'Log in to your DoorCompliance.co.uk account to manage fire door inspections, track compliance, and generate reports for Fire Safety (England) Regulations 2022.',
  openGraph: {
    title: 'Login to DoorCompliance.co.uk',
    description: 'Access your fire door inspection management dashboard',
  },
  alternates: {
    canonical: 'https://doorcompliance.co.uk/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
