'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import InterviewStructureCard from '@/components/shared/InterviewStructureCard';
import EmptyState from '@/components/shared/EmptyState';

interface InterviewStructuresSectionProps {
  title: string;
  structures: InterviewStructure[];
  emptyMessage: string;
  emptyActionText?: string;
  emptyActionHref?: string;
  showViewButton?: boolean;
  viewButtonText?: string;
  viewButtonHref?: string;
  emptyStateIcon?: string;
  emptyStateDescription?: string;
}

const InterviewStructuresSection = ({
  title,
  structures,
  emptyMessage,
  emptyActionText,
  emptyActionHref,
  showViewButton = false,
  viewButtonText = "View All",
  viewButtonHref = "#",
  emptyStateIcon = "/tech.svg",
  emptyStateDescription
}: InterviewStructuresSectionProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-semibold text-primary-100">{title}</h2>
        </div>
        <div className="flex-grow h-px bg-gradient-to-r from-primary-500/20 to-transparent"></div>
        {showViewButton && structures.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link href={viewButtonHref}>{viewButtonText}</Link>
          </Button>
        )}
      </div>
      
      {structures && structures.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {structures.map((structure) => (
            <InterviewStructureCard
              key={structure.id}
              id={structure.id}
              role={structure.role}
              level={structure.level}
              type={structure.type}
              techstack={structure.techstack}
              interviewCategory={structure.interviewCategory || 'mock'}
              compulsoryQuestions={structure.compulsoryQuestions}
              personalizedQuestions={structure.personalizedQuestions}
              usageCount={structure.usageCount || 0}
              createdAt={structure.createdAt}
              jobTitle={structure.jobTitle}
              location={structure.location}
              ctc={structure.ctc}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={emptyStateIcon || '/user.png'}
          containerSize="md"
          title={emptyMessage}
          description={emptyStateDescription || 'No items to display at the moment.'}
          primaryAction={emptyActionText && emptyActionHref ? {
            text: emptyActionText,
            href: emptyActionHref
          } : undefined}
        />
      )}
    </div>
  );
};

export default InterviewStructuresSection;
