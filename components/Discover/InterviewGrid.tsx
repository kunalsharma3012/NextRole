'use client'

import React from 'react'
import InterviewStructureCard from '@/components/shared/InterviewStructureCard'
import DiscoverEmptyState from './DiscoverEmptyState'
import ResultsStats from './ResultsStats'

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

interface InterviewGridProps {
  interviews: InterviewStructure[]
  totalCount: number
  searchParams: {
    search?: string
    category?: 'mock' | 'job' | 'all'
    type?: 'technical' | 'behavioral' | 'mixed' | 'all'
    level?: 'entry' | 'mid' | 'senior' | 'all'
  }
}

const InterviewGrid = ({ interviews, totalCount, searchParams }: InterviewGridProps) => {
  return (
    <div>
      <ResultsStats 
        filteredCount={interviews.length}
        totalCount={totalCount}
        filters={searchParams}
      />
      
      {interviews.length === 0 ? (
        <div className="card-border w-full">
          <div className="dark-gradient rounded-2xl p-8">
            <DiscoverEmptyState 
              title="No interviews found"
              description="Try adjusting your filters or search criteria to find more interviews."
            />
          </div>
        </div>
      ) : (
        <div className="interviews-section">
          {interviews.map((interview) => (
            <InterviewStructureCard
              key={interview.id}
              id={interview.id}
              role={interview.role}
              level={interview.level}
              type={interview.type}
              techstack={interview.techstack}
              interviewCategory={interview.interviewCategory}
              compulsoryQuestions={interview.compulsoryQuestions}
              personalizedQuestions={interview.personalizedQuestions}
              usageCount={interview.usageCount || 0}
              createdAt={interview.createdAt}
              jobTitle={interview.jobTitle}
              location={interview.location}
              ctc={interview.ctc}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default InterviewGrid
