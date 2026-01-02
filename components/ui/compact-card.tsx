import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CompactCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function CompactCard({ title, description, children, className = '' }: CompactCardProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-3 space-y-1">
          {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pb-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  )
}

interface CompactSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function CompactSection({ title, children, className = '' }: CompactSectionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-1">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

interface CompactFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
}

export function CompactField({ label, children, required = false }: CompactFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
