import React from 'react'
import Link from 'next/link'
import InterviewStructureCard from '@/components/shared/InterviewStructureCard'
import EmptyState from './EmptyState'

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
}

interface InterviewSectionProps {
  title: string
  subtitle?: string
  interviews: InterviewStructure[]
  interviewCategory: 'mock' | 'job'
  userId?: string
  emptyStateTitle: string
  emptyStateDescription: string
  showCreateButton?: boolean
}

const InterviewSection = ({
  title,
  subtitle,
  interviews,
  interviewCategory,
  userId,
  emptyStateTitle,
  emptyStateDescription,
  showCreateButton = false
}: InterviewSectionProps) => {
  const hasInterviews = interviews && interviews.length > 0

  return (
    <section className='flex flex-col gap-6 mt-8'>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-4 w-full">
          <h2>{title}</h2>
          <Link 
            href={`/discover?category=${interviewCategory}`}
            className="group flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 hover:border-primary-400/50 rounded-lg text-primary-200 hover:text-primary-100 text-sm font-medium transition-all duration-200 ease-in-out"
          >
            <span>Explore All</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {subtitle && <p className="text-primary-300 text-sm">{subtitle}</p>}
      </div>
      <div className='interviews-section'>
        {hasInterviews ? (
          interviews.map((structure) => (
            <InterviewStructureCard 
              key={structure.id} 
              {...structure}
              interviewCategory={interviewCategory}
              usageCount={structure.usageCount || 0}
              createdAt={structure.createdAt}
            />
          ))
        ) : (
          <EmptyState 
            title={emptyStateTitle}
            showButton={showCreateButton}
            userId={userId}
            description={emptyStateDescription}
            interviewCategory={interviewCategory}
          />
        )}
      </div>
    </section>
  )
}

export default InterviewSection
