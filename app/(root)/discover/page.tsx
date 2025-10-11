import React from 'react'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getPublicInterviewStructures } from '@/lib/actions/general.actions'
import SearchFilters from '@/components/Discover/SearchFilters'
import InterviewGrid from '@/components/Discover/InterviewGrid'

interface SearchParams {
  search?: string
  category?: 'mock' | 'job' | 'all'
  type?: 'technical' | 'behavioral' | 'mixed' | 'all'
  level?: 'entry' | 'mid' | 'senior' | 'all'
}

interface InterviewStructure {
  id: string
  role: string
  level: string
  type: string
  techstack: string[]
  compulsoryQuestions: number
  personalizedQuestions: number
  usageCount?: number
  createdAt: string
  jobTitle?: string
  location?: string
  ctc?: string
  interviewCategory: 'mock' | 'job'
}

// Utility function to filter interviews
const filterInterviews = (interviews: InterviewStructure[], searchParams: SearchParams) => {
  let filtered = interviews

  // Filter by search term (only in role field)
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    filtered = filtered.filter(interview => 
      interview.role.toLowerCase().includes(searchTerm)
    )
  }

  // Filter by category
  if (searchParams.category && searchParams.category !== 'all') {
    filtered = filtered.filter(interview => 
      interview.interviewCategory === searchParams.category
    )
  }

  // Filter by type
  if (searchParams.type && searchParams.type !== 'all') {
    filtered = filtered.filter(interview => 
      interview.type.toLowerCase() === searchParams.type
    )
  }

  // Filter by level
  if (searchParams.level && searchParams.level !== 'all') {
    filtered = filtered.filter(interview => 
      interview.level.toLowerCase() === searchParams.level
    )
  }

  return filtered
}

const DiscoverPage = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Please sign in to view interviews</div>
  }

  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams

  // Get all public interview structures (no limit for discover page)
  const publicStructures = await getPublicInterviewStructures(100, 100)

  // Combine mock and job interviews
  const allInterviews = [
    ...(publicStructures.mockStructures || []).map(interview => ({
      ...interview,
      interviewCategory: 'mock' as const
    })),
    ...(publicStructures.jobStructures || []).map(interview => ({
      ...interview,
      interviewCategory: 'job' as const
    }))
  ]

  // Filter interviews based on search parameters
  const filteredInterviews = filterInterviews(allInterviews, resolvedSearchParams)

  return (
    <div className="pattern">
      <SearchFilters 
        searchParams={resolvedSearchParams}
        totalCount={filteredInterviews.length}
      />

      <InterviewGrid 
        interviews={filteredInterviews}
        totalCount={allInterviews.length}
        searchParams={resolvedSearchParams}
      />
    </div>
  )
}

export default DiscoverPage
