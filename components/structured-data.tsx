export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DoorCompliance.co.uk',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free trial available',
    },
    description: 'Professional fire door inspection management system compliant with Fire Safety (England) Regulations 2022',
    url: 'https://doorcompliance.co.uk',
    publisher: {
      '@type': 'Organization',
      name: 'DoorCompliance.co.uk',
      url: 'https://doorcompliance.co.uk',
    },
    featureList: [
      'Fire door inspection tracking',
      'Compliance management',
      'Defect reporting',
      'QR code generation',
      'PDF report generation',
      'Multi-tenant support',
      'Building safety compliance',
    ],
    about: {
      '@type': 'Thing',
      name: 'Fire Safety Compliance',
      description: 'Fire Safety (England) Regulations 2022 compliance management',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DoorCompliance.co.uk',
    url: 'https://doorcompliance.co.uk',
    description: 'Professional fire door inspection management system compliant with Fire Safety (England) Regulations 2022',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://doorcompliance.co.uk/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
