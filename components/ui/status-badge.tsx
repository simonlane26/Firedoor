import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getStatusConfig } from '@/lib/status-config'

interface StatusBadgeProps {
  status: string
  showTooltip?: boolean
  className?: string
}

export function StatusBadge({ status, showTooltip = true, className = '' }: StatusBadgeProps) {
  const config = getStatusConfig(status)

  const badge = (
    <Badge variant={config.badgeVariant} className={className}>
      {config.icon} {config.label}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
