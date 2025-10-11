import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { checkProfileCompletion } from '@/lib/actions/general.actions'
import InterviewGenerationLoader from '@/components/interview/InterviewGenerationLoader'

interface GenerateInterviewPageProps {
  searchParams: Promise<{
    structureId?: string;
    confirmed?: string;
  }>
}

const GenerateInterviewPage = async ({ searchParams }: GenerateInterviewPageProps) => {
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

  // Await searchParams and check if structureId and confirmation are provided
  const { structureId, confirmed } = await searchParams;
  if (!structureId || !confirmed) {
    redirect('/discover');
  }

  return (
    <div className="w-full mx-auto py-12 px-4 bg-dark-300 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-100 mb-4 text-center">Generating Your Interview</h1>
        <p className="text-center text-primary-300 mb-12 max-w-2xl mx-auto">
          Please wait while we generate personalized interview questions based on your profile and the selected interview structure.
        </p>
        
        <InterviewGenerationLoader 
          user={user} 
          structureId={structureId}
        />
      </div>
    </div>
  )
}

export default GenerateInterviewPage
