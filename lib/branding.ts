import { Tenant } from '@prisma/client'

export interface BrandingConfig {
  companyName: string
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  brandingEnabled: boolean
  customCss: string | null
}

/**
 * Get branding configuration from tenant
 */
export function getBrandingConfig(tenant: Tenant): BrandingConfig {
  return {
    companyName: tenant.companyName,
    logoUrl: tenant.logoUrl,
    faviconUrl: tenant.faviconUrl,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    accentColor: tenant.accentColor,
    textColor: tenant.textColor,
    backgroundColor: tenant.backgroundColor,
    brandingEnabled: tenant.brandingEnabled,
    customCss: tenant.customCss,
  }
}

/**
 * Generate CSS variables from branding config
 */
export function generateCssVariables(branding: BrandingConfig): string {
  if (!branding.brandingEnabled) {
    // Return default Fire Door Inspector theme
    return `
      :root {
        --brand-primary: #dc2626;
        --brand-secondary: #991b1b;
        --brand-accent: #f59e0b;
        --brand-text: #1f2937;
        --brand-background: #ffffff;
      }
    `
  }

  return `
    :root {
      --brand-primary: ${branding.primaryColor};
      --brand-secondary: ${branding.secondaryColor};
      --brand-accent: ${branding.accentColor};
      --brand-text: ${branding.textColor};
      --brand-background: ${branding.backgroundColor};
    }
    ${branding.customCss || ''}
  `
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Validate URL format (accepts both full URLs and relative paths)
 */
export function isValidUrl(url: string): boolean {
  // Allow relative paths starting with /
  if (url.startsWith('/')) {
    return true
  }

  // Validate full URLs
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize custom CSS to prevent malicious code
 */
export function sanitizeCustomCss(css: string): string {
  // Remove dangerous CSS properties and values
  const dangerous = [
    'javascript:',
    'expression(',
    '@import',
    'behavior:',
    '-moz-binding',
  ]

  let sanitized = css

  dangerous.forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  return sanitized
}

/**
 * Get default branding configuration
 */
export function getDefaultBranding(): Omit<BrandingConfig, 'companyName'> {
  return {
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#f59e0b',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    brandingEnabled: true,
    customCss: null,
  }
}

/**
 * Validate branding configuration
 */
export function validateBrandingConfig(config: Partial<BrandingConfig>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.primaryColor && !isValidHexColor(config.primaryColor)) {
    errors.push('Primary color must be a valid hex color (e.g., #dc2626)')
  }

  if (config.secondaryColor && !isValidHexColor(config.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color (e.g., #991b1b)')
  }

  if (config.accentColor && !isValidHexColor(config.accentColor)) {
    errors.push('Accent color must be a valid hex color (e.g., #f59e0b)')
  }

  if (config.textColor && !isValidHexColor(config.textColor)) {
    errors.push('Text color must be a valid hex color (e.g., #1f2937)')
  }

  if (config.backgroundColor && !isValidHexColor(config.backgroundColor)) {
    errors.push('Background color must be a valid hex color (e.g., #ffffff)')
  }

  if (config.logoUrl && config.logoUrl.trim() !== '' && !isValidUrl(config.logoUrl)) {
    errors.push('Logo URL must be a valid URL')
  }

  if (config.faviconUrl && config.faviconUrl.trim() !== '' && !isValidUrl(config.faviconUrl)) {
    errors.push('Favicon URL must be a valid URL')
  }

  if (config.customCss && config.customCss.length > 10000) {
    errors.push('Custom CSS must be less than 10,000 characters')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
