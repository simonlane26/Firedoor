import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { OrganizationSchema, WebsiteSchema } from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://doorcompliance.co.uk'),
  title: {
    default: "DoorCompliance.co.uk - Fire Door Inspection Management Software",
    template: "%s | DoorCompliance.co.uk"
  },
  description: "Professional fire door inspection management system compliant with Fire Safety (England) Regulations 2022. Track inspections, manage defects, generate compliance reports, and maintain building safety with our cloud-based platform.",
  keywords: [
    'fire door inspection',
    'fire door compliance',
    'fire safety regulations 2022',
    'building safety act',
    'fire door management software',
    'compliance management system',
    'fire door inspection software',
    'fire safety compliance',
    'fire door certification',
    'building safety compliance',
    'fire door inspection app',
    'fire safety management',
    'regulatory compliance software',
    'fire door maintenance tracking'
  ],
  authors: [{ name: 'DoorCompliance.co.uk' }],
  creator: 'DoorCompliance.co.uk',
  publisher: 'DoorCompliance.co.uk',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://doorcompliance.co.uk',
    title: 'DoorCompliance.co.uk - Fire Door Inspection Management Software',
    description: 'Professional fire door inspection management system compliant with Fire Safety (England) Regulations 2022. Track inspections, manage defects, and maintain compliance.',
    siteName: 'DoorCompliance.co.uk',
    images: [
      {
        url: '/OG Image.png',
        width: 1200,
        height: 630,
        alt: 'DoorCompliance.co.uk - Fire Door Inspection Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoorCompliance.co.uk - Fire Door Inspection Management',
    description: 'Professional fire door inspection software compliant with Fire Safety (England) Regulations 2022.',
    images: ['/OG Image.png'],
    creator: '@doorcompliance',
  },
  alternates: {
    canonical: 'https://doorcompliance.co.uk',
  },
  category: 'Fire Safety Software',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
