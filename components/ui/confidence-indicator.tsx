import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low'
  score?: number
  reason?: string
  breakdown?: string[]
}

export function ConfidenceIndicator({ level, score, reason, breakdown }: ConfidenceIndicatorProps) {
  const getConfig = () => {
    switch (level) {
      case 'high':
        return {
          color: 'bg-green-500',
          label: 'High Confidence',
          bars: 3,
          description: reason || 'Recent inspection with evidence'
        }
      case 'medium':
        return {
          color: 'bg-amber-500',
          label: 'Medium Confidence',
          bars: 2,
          description: reason || 'Inspection data available'
        }
      case 'low':
        return {
          color: 'bg-red-500',
          label: 'Low Confidence',
          bars: 1,
          description: reason || 'Limited or outdated data'
        }
    }
  }

  const config = getConfig()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5 cursor-help" aria-label={config.label}>
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-3 rounded-sm ${
                  bar <= config.bars ? config.color : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">{config.label}</p>
              {score !== undefined && (
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {score}/100
                </span>
              )}
            </div>
            <p className="text-slate-600">{config.description}</p>
            {breakdown && breakdown.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <p className="font-medium text-slate-700">Score Breakdown:</p>
                {breakdown.map((item, index) => (
                  <p key={index} className="text-slate-600 text-xs leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
