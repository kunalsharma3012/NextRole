import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { checkProfileCompletion } from '@/lib/actions/general.actions'
import TakeInterview from '@/components/interview/TakeInterview'

interface TakeInterviewPageProps {
  searchParams: Promise<{
    structureId?: string;
  }>
}

const TakeInterviewPage = async ({ searchParams }: TakeInterviewPageProps) => {
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

  // Redirect to the structure route for better organization
  const searchParamsString = new URLSearchParams({ structureId }).toString();
  redirect(`/interview/structure?${searchParamsString}`);
}

export default TakeInterviewPage
