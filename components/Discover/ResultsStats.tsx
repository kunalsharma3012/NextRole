import React from 'react'

interface ResultsStatsProps {
  filteredCount: number
  totalCount: number
  filters: {
    search?: string
    category?: string
    type?: string
    level?: string
  }
}

const ResultsStats = ({ filteredCount, totalCount, filters }: ResultsStatsProps) => {
  const hasActiveFilters = Object.values(filters).some(filter => filter && filter !== 'all')

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-primary-100">
          {hasActiveFilters ? `${filteredCount} of ${totalCount}` : `${totalCount}`} 
          <span className="text-primary-300 font-normal ml-2">interviews</span>
        </h2>
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="px-4 py-2 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium border border-blue-500/30">
              Search: &ldquo;{filters.search}&rdquo;
            </span>
          )}
          {filters.category && filters.category !== 'all' && (
            <span className="px-4 py-2 bg-green-500/20 text-green-200 rounded-full text-sm font-medium border border-green-500/30">
              {filters.category === 'mock' ? 'Mock Interview' : 'Job Interview'}
            </span>
          )}
          {filters.type && filters.type !== 'all' && (
            <span className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30">
              {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
            </span>
          )}
          {filters.level && filters.level !== 'all' && (
            <span className="px-4 py-2 bg-orange-500/20 text-orange-200 rounded-full text-sm font-medium border border-orange-500/30">
              {filters.level.charAt(0).toUpperCase() + filters.level.slice(1)} Level
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultsStats
