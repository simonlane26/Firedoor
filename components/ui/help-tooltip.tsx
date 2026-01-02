import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help inline-block ${className}`} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface InfoBannerProps {
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export function InfoBanner({ children, variant = 'info' }: InfoBannerProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  return (
    <div className={`flex items-start gap-2 p-2 border rounded-md ${styles[variant]}`}>
      <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  )
}
