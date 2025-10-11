import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { checkProfileCompletion, getProfileByUserId } from '@/lib/actions/general.actions'
import ProfileSummaryConfirmation from '@/components/interview/ProfileSummaryConfirmation'

interface ConfirmProfilePageProps {
  searchParams: Promise<{
    structureId?: string;
  }>
}

const ConfirmProfilePage = async ({ searchParams }: ConfirmProfilePageProps) => {
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

  // Get user profile for display
  const userProfile = await getProfileByUserId(user.id);

  return (
    <div className="w-full mx-auto py-12 px-4 bg-dark-300 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-100 mb-4 text-center">Confirm Your Profile</h1>
        <p className="text-center text-primary-300 mb-12 max-w-2xl mx-auto">
          Please review your profile information below. This will be used to generate personalized interview questions for you.
        </p>
        
        <ProfileSummaryConfirmation 
          user={user} 
          userProfile={userProfile}
          structureId={structureId}
        />
      </div>
    </div>
  )
}

export default ConfirmProfilePage
