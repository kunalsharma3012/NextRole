import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { checkProfileCompletion } from '@/lib/actions/general.actions'
import TakeInterview from '@/components/interview/TakeInterview'

interface TakeInterviewStructurePageProps {
  searchParams: Promise<{
    structureId?: string;
  }>
}

const TakeInterviewStructurePage = async ({ searchParams }: TakeInterviewStructurePageProps) => {
  const user = await getCurrentUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect('/sign-in');
  }

  // Check if profile is completed
  const isProfileCompleted = await checkProfileCompletion(user.id);
  
  if (!isProfileCompleted) {
    redirect(`/user/${user.id}/profile/complete`);
  }

  // Await searchParams and check if structureId is provided
  const { structureId } = await searchParams;
  if (!structureId) {
    redirect('/discover');
  }

  return (
    <div className="w-full mx-auto py-12 px-4 bg-dark-300">
      <h1 className="text-4xl font-bold text-primary-100 mb-4 text-center">Take Interview</h1>
      <p className="text-center text-primary-300 mb-12 max-w-2xl mx-auto">
        Get ready for your personalized interview experience. Questions will be tailored based on your profile and the selected structure.
      </p>
      <TakeInterview 
        user={user} 
        structureId={structureId}
        isStructureBased={true}
      />
    </div>
  )
}

export default TakeInterviewStructurePage
