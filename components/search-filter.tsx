'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  filters?: {
    label: string
    options: FilterOption[]
    activeFilter: string
    onFilterChange: (value: string) => void
  }[]
  sortOptions?: {
    label: string
    value: string
  }[]
  activeSort?: string
  onSortChange?: (value: string) => void
}

export function SearchFilter({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  sortOptions = [],
  activeSort = '',
  onSortChange
}: SearchFilterProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filters and Sort */}
      {(filters.length > 0 || sortOptions.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {/* Filters */}
          {filters.map((filter, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">{filter.label}:</span>
              <div className="flex gap-2 flex-wrap">
                {filter.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter.activeFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => filter.onFilterChange(option.value)}
                    className={
                      filter.activeFilter === option.value
                        ? 'bg-red-600 hover:bg-red-700'
                        : ''
                    }
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          filter.activeFilter === option.value
                            ? 'bg-white text-red-600'
                            : 'bg-slate-100'
                        }`}
                      >
                        {option.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Sort */}
          {sortOptions.length > 0 && onSortChange && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-slate-700">Sort:</span>
              <select
                value={activeSort || ''}
                onChange={(e) => onSortChange(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
