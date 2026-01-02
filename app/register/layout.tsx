import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Start Your Free Trial',
  description: 'Create your free DoorCompliance.co.uk account and start managing fire door inspections in compliance with Fire Safety (England) Regulations 2022. No credit card required.',
  openGraph: {
    title: 'Register for DoorCompliance.co.uk - Free Trial',
    description: 'Start managing fire door inspections today with our compliant software solution',
  },
  alternates: {
    canonical: 'https://doorcompliance.co.uk/register',
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
