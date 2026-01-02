# Custom Branding System Documentation

## Overview
Comprehensive per-tenant branding system allowing organizations to customize logos, colors, and styling to match their brand identity.

---

## Features

✅ **Logo Upload** - Custom logo and favicon with file upload
✅ **Color Customization** - 5 customizable color properties
✅ **Live Preview** - Real-time preview of branding changes
✅ **Custom CSS** - Advanced styling with custom CSS
✅ **CSS Variables** - Easy theming with CSS variable system
✅ **Global Application** - Branding applies across entire application
✅ **Per-Tenant** - Each tenant has independent branding
✅ **Admin Only** - Only administrators can modify branding
✅ **Reset to Defaults** - Quick reset to default Fire Door Inspector theme

---

## Components

### 1. Branding Service
**File:** [lib/branding.ts](lib/branding.ts)

#### Functions:

**`getBrandingConfig(tenant: Tenant): BrandingConfig`**
- Extracts branding configuration from tenant
- Returns structured branding object

**`generateCssVariables(branding: BrandingConfig): string`**
- Generates CSS with CSS custom properties
- Injects custom CSS if provided
- Returns default theme if branding disabled

**`validateBrandingConfig(config: Partial<BrandingConfig>): { valid: boolean, errors: string[] }`**
- Validates all branding fields
- Checks hex color format
- Validates URLs
- Returns validation result with error messages

**`sanitizeCustomCss(css: string): string`**
- Removes dangerous CSS patterns
- Prevents XSS attacks
- Strips javascript:, expression(), @import, etc.

**`isValidHexColor(color: string): boolean`**
- Validates hex color format (#RRGGBB)

**`isValidUrl(url: string): boolean`**
- Validates URL format

**`getDefaultBranding(): BrandingConfig`**
- Returns default Fire Door Inspector branding

#### Types:

```typescript
interface BrandingConfig {
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
```

---

### 2. Branding API

#### **GET /api/branding**
**File:** [app/api/branding/route.ts](app/api/branding/route.ts)

Retrieves current tenant's branding configuration.

**Response:**
```json
{
  "companyName": "Example Fire Safety Ltd",
  "logoUrl": "/uploads/branding/tenant-id/logo-123456.png",
  "faviconUrl": "/uploads/branding/tenant-id/favicon-123456.ico",
  "primaryColor": "#dc2626",
  "secondaryColor": "#991b1b",
  "accentColor": "#f59e0b",
  "textColor": "#1f2937",
  "backgroundColor": "#ffffff",
  "brandingEnabled": true,
  "customCss": null
}
```

---

#### **PATCH /api/branding**
**File:** [app/api/branding/route.ts](app/api/branding/route.ts)

Updates tenant's branding configuration (Admin only).

**Request:**
```json
{
  "companyName": "My Fire Safety Company",
  "primaryColor": "#e11d48",
  "secondaryColor": "#be123c",
  "accentColor": "#fb923c",
  "brandingEnabled": true
}
```

**Response:**
```json
{
  "companyName": "My Fire Safety Company",
  "logoUrl": null,
  "faviconUrl": null,
  "primaryColor": "#e11d48",
  "secondaryColor": "#be123c",
  "accentColor": "#fb923c",
  "textColor": "#1f2937",
  "backgroundColor": "#ffffff",
  "brandingEnabled": true,
  "customCss": null
}
```

**Validation Errors:**
```json
{
  "error": "Validation failed",
  "errors": [
    "Primary color must be a valid hex color (e.g., #dc2626)",
    "Logo URL must be a valid URL"
  ]
}
```

---

#### **POST /api/branding/upload-logo**
**File:** [app/api/branding/upload-logo/route.ts](app/api/branding/upload-logo/route.ts)

Uploads logo or favicon image (Admin only).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Fields:
  - `file` - Image file (PNG, JPG, SVG, ICO)
  - `type` - Either "logo" or "favicon"

**Response:**
```json
{
  "success": true,
  "url": "/uploads/branding/tenant-id/logo-1234567890.png",
  "type": "logo"
}
```

**Validation:**
- File type: PNG, JPG, JPEG, SVG, ICO only
- Max file size: 2MB
- Automatically updates tenant record with new URL

---

### 3. Branding Settings Page
**File:** [app/settings/branding/page.tsx](app/settings/branding/page.tsx)

Interactive UI for managing branding configuration.

**Sections:**

1. **Company Information**
   - Company name text input

2. **Logo & Favicon**
   - Logo upload (PNG, JPG, SVG)
   - Favicon upload (PNG, ICO)
   - Image preview
   - File size limit: 2MB

3. **Color Scheme**
   - Primary Color - Main brand color
   - Secondary Color - Secondary brand color
   - Accent Color - Accent/highlight color
   - Text Color - Default text color
   - Background Color - Page background color
   - Color picker + hex input for each

4. **Custom CSS**
   - Expandable textarea for custom CSS
   - CSS variable documentation
   - Character limit: 10,000

5. **Branding Status**
   - Toggle to enable/disable custom branding
   - When disabled, uses default theme

6. **Live Preview**
   - Real-time preview of branding changes
   - Sample header, cards, buttons, badges
   - Color palette swatches

**Actions:**
- **Save Changes** - Saves all branding settings
- **Reset to Defaults** - Resets to Fire Door Inspector defaults
- **Upload Logo/Favicon** - File upload buttons

---

### 4. Branding Preview Component
**File:** [components/branding-preview.tsx](components/branding-preview.tsx)

Visual preview component showing how branding will appear.

**Preview Elements:**
- Header with logo/icon and company name
- Dashboard button in primary color
- Statistics cards
- Action buttons (primary, secondary, accent)
- Status badges (pass, fail, pending)
- Color palette swatches with hex codes

---

### 5. Branding Provider
**File:** [components/branding-provider.tsx](components/branding-provider.tsx)

Client-side provider that fetches and applies branding globally.

**Functionality:**
- Fetches branding on mount
- Generates and injects CSS variables
- Updates favicon dynamically
- Updates document title with company name
- Applies custom CSS if provided

**CSS Variables Generated:**
```css
:root {
  --brand-primary: #dc2626;
  --brand-secondary: #991b1b;
  --brand-accent: #f59e0b;
  --brand-text: #1f2937;
  --brand-background: #ffffff;
}
```

---

## Database Schema

### Tenant Model Branding Fields

```prisma
model Tenant {
  // ... other fields

  // Branding
  logoUrl           String?
  faviconUrl        String?
  primaryColor      String    @default("#dc2626")
  secondaryColor    String    @default("#991b1b")
  accentColor       String    @default("#f59e0b")
  textColor         String    @default("#1f2937")
  backgroundColor   String    @default("#ffffff")
  brandingEnabled   Boolean   @default(true)
  customCss         String?

  // Contact
  contactEmail      String?
  contactPhone      String?
  websiteUrl        String?
  address           String?

  // ... other fields
}
```

---

## Usage Guide

### Accessing Branding Settings

1. Log in as an **Administrator**
2. Navigate to Dashboard
3. Click "Branding" button in header
4. Or visit: [http://localhost:3000/settings/branding](http://localhost:3000/settings/branding)

---

### Uploading a Logo

1. Go to Branding Settings
2. Scroll to "Logo & Favicon" section
3. Click "Upload Logo" button
4. Select image file (PNG, JPG, or SVG)
5. Wait for upload to complete
6. Logo preview appears
7. Click "Save Changes" to apply

**Recommended Logo Dimensions:**
- Width: 200-400px
- Height: 40-80px
- Format: PNG with transparency or SVG
- File size: Under 500KB

---

### Uploading a Favicon

1. Go to Branding Settings
2. Scroll to "Logo & Favicon" section
3. Click "Upload Favicon" button
4. Select favicon file (PNG or ICO)
5. Wait for upload to complete
6. Favicon preview appears
7. Click "Save Changes" to apply

**Favicon Requirements:**
- Dimensions: 32x32 or 16x16 pixels
- Format: PNG or ICO
- File size: Under 100KB

---

### Customizing Colors

1. Go to Branding Settings
2. Scroll to "Color Scheme" section
3. For each color:
   - Click the color picker box
   - Select color from picker, OR
   - Type hex code in text input
4. See live preview update in real-time
5. Click "Save Changes" when satisfied

**Color Usage:**
- **Primary Color** - Main buttons, links, active states
- **Secondary Color** - Hover states, secondary buttons
- **Accent Color** - Highlights, warnings, pending states
- **Text Color** - Body text, headings
- **Background Color** - Page background, cards

---

### Adding Custom CSS

1. Go to Branding Settings
2. Scroll to "Custom CSS" section
3. Click "Show" to expand textarea
4. Enter custom CSS code
5. Use CSS variables for consistency:
   ```css
   .my-custom-button {
     background-color: var(--brand-primary);
     color: var(--brand-background);
   }
   ```
6. Click "Save Changes"

**CSS Variables Available:**
- `--brand-primary`
- `--brand-secondary`
- `--brand-accent`
- `--brand-text`
- `--brand-background`

**Limitations:**
- Max 10,000 characters
- Dangerous patterns automatically removed
- No `@import`, `javascript:`, or `expression()`

---

### Resetting to Defaults

1. Go to Branding Settings
2. Click "Reset to Defaults" button
3. Confirm the action
4. All fields reset to Fire Door Inspector defaults
5. Click "Save Changes" to apply reset

**Default Values:**
- Primary Color: `#dc2626` (Red 600)
- Secondary Color: `#991b1b` (Red 800)
- Accent Color: `#f59e0b` (Amber 500)
- Text Color: `#1f2937` (Gray 800)
- Background Color: `#ffffff` (White)
- Logo: None
- Favicon: None

---

### Disabling Custom Branding

1. Go to Branding Settings
2. Scroll to "Branding Status" section
3. Uncheck "Enable custom branding"
4. Click "Save Changes"
5. Application reverts to default Fire Door Inspector theme

---

## CSS Variables Usage

### In React Components

```tsx
<div
  style={{
    backgroundColor: 'var(--brand-primary)',
    color: 'var(--brand-background)'
  }}
>
  Button
</div>
```

### In CSS Files

```css
.custom-button {
  background-color: var(--brand-primary);
  border-color: var(--brand-secondary);
  color: white;
}

.custom-button:hover {
  background-color: var(--brand-secondary);
}

.accent-badge {
  background-color: var(--brand-accent);
  color: white;
}
```

### In Tailwind Config (Future Enhancement)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--brand-primary)',
        secondary: 'var(--brand-secondary)',
        accent: 'var(--brand-accent)',
      }
    }
  }
}
```

---

## File Upload System

### Upload Directory Structure

```
public/
  uploads/
    branding/
      {tenant-id}/
        logo-{timestamp}.{ext}
        favicon-{timestamp}.{ext}
```

**Example:**
```
public/uploads/branding/cm4abc123/logo-1702345678901.png
public/uploads/branding/cm4abc123/favicon-1702345678902.ico
```

### File Storage

- Files stored in `public/uploads/branding/{tenantId}/`
- Accessible via `/uploads/branding/{tenantId}/{filename}`
- Each tenant has isolated directory
- Old files not automatically deleted (manual cleanup needed)

---

## Security Considerations

### Access Control

- **Branding Settings Page**: Admin only
- **Upload API**: Admin only
- **Branding API GET**: All authenticated users
- **Branding API PATCH**: Admin only

### File Upload Security

1. **File Type Validation**
   - Whitelist: PNG, JPG, JPEG, SVG, ICO only
   - MIME type checking
   - Extension validation

2. **File Size Limits**
   - Max 2MB per file
   - Enforced server-side

3. **File Storage**
   - Tenant-isolated directories
   - No executable files allowed
   - Files served from public directory

### CSS Security

1. **Sanitization**
   - Removes `javascript:`
   - Removes `expression()`
   - Removes `@import`
   - Removes `-moz-binding`
   - Removes `behavior:`

2. **Validation**
   - 10,000 character limit
   - Hex color format validation
   - URL format validation

### Tenant Isolation

- Each tenant's branding stored separately
- Cannot access other tenant's uploads
- Branding API filtered by tenant ID
- Upload directories per-tenant

---

## Troubleshooting

### Logo Not Displaying

**Problem:** Logo uploaded but not showing

**Solutions:**
1. Check file was uploaded successfully
2. Verify `logoUrl` in branding settings
3. Check browser console for 404 errors
4. Ensure file exists in `public/uploads/branding/{tenantId}/`
5. Try refreshing page (Ctrl+F5)

---

### Colors Not Applying

**Problem:** Changed colors but not reflected in UI

**Solutions:**
1. Click "Save Changes" button
2. Refresh browser (Ctrl+F5)
3. Check "Enable custom branding" is checked
4. Verify hex color format (must be #RRGGBB)
5. Check browser console for errors

---

### Upload Fails

**Problem:** File upload returns error

**Common Causes:**
1. File too large (>2MB)
   - Solution: Compress image or use smaller file

2. Invalid file type
   - Solution: Convert to PNG, JPG, or SVG

3. Permission error
   - Solution: Check server write permissions

4. Not admin user
   - Solution: Log in as Administrator

---

### Custom CSS Not Working

**Problem:** Custom CSS added but no effect

**Solutions:**
1. Click "Save Changes"
2. Check CSS syntax for errors
3. Use browser DevTools to inspect elements
4. Verify CSS variables are used correctly
5. Check for CSS specificity issues
6. Ensure dangerous patterns weren't stripped

---

### Branding Not Loading

**Problem:** Branding provider fails to load

**Solutions:**
1. Check browser console for errors
2. Verify `/api/branding` endpoint is accessible
3. Check network tab for failed requests
4. Ensure tenant is configured
5. Try logging out and back in

---

## Best Practices

### Logo Design

1. **Use SVG when possible** - Scalable and small file size
2. **PNG with transparency** - For complex logos
3. **Simple designs** - Work better at small sizes
4. **Horizontal orientation** - Fits better in header
5. **High contrast** - Readable on light and dark backgrounds

### Color Selection

1. **Accessibility** - Ensure sufficient contrast ratios
   - Text on background: minimum 4.5:1
   - Large text on background: minimum 3:1

2. **Consistency** - Use colors consistently:
   - Primary: Main actions, links
   - Secondary: Less important actions
   - Accent: Highlights, alerts

3. **Testing** - Test colors in different contexts:
   - Light and dark backgrounds
   - Text and buttons
   - Charts and badges

4. **Brand Guidelines** - Follow your organization's brand guidelines

### Custom CSS

1. **Use CSS Variables** - Easier to maintain
2. **Minimal Changes** - Only override what's necessary
3. **Test Thoroughly** - Check all pages and components
4. **Document Changes** - Comment your CSS
5. **Avoid !important** - Use proper CSS specificity

---

## API Integration Examples

### Fetch Current Branding

```typescript
const response = await fetch('/api/branding')
const branding = await response.json()

console.log(branding.primaryColor) // "#dc2626"
```

### Update Colors

```typescript
const response = await fetch('/api/branding', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primaryColor: '#e11d48',
    secondaryColor: '#be123c',
    accentColor: '#fb923c'
  })
})

const updated = await response.json()
```

### Upload Logo

```typescript
const formData = new FormData()
formData.append('file', logoFile)
formData.append('type', 'logo')

const response = await fetch('/api/branding/upload-logo', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log(result.url) // "/uploads/branding/tenant-id/logo-123.png"
```

---

## Future Enhancements

- [ ] Font customization (Google Fonts integration)
- [ ] Dark mode support with separate color scheme
- [ ] Multiple logo variants (light/dark theme)
- [ ] Brand asset library (multiple logos, icons)
- [ ] Email template branding
- [ ] PDF report branding
- [ ] QR code branding customization
- [ ] Advanced CSS editor with syntax highlighting
- [ ] Branding preview on multiple device sizes
- [ ] Export/import branding configuration
- [ ] Branding version history
- [ ] A/B testing different branding variations

---

## Summary

The custom branding system is now fully operational with:

✅ Logo and favicon uploads
✅ 5-color customization system
✅ Live preview of changes
✅ Custom CSS support
✅ CSS variables for easy theming
✅ Global application of branding
✅ Admin-only access control
✅ Per-tenant isolation
✅ Security measures for uploads and CSS

**Access branding settings at:** [http://localhost:3000/settings/branding](http://localhost:3000/settings/branding)
