import InterviewForm from '@/components/create-interview/InterviewForm'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { checkProfileCompletion } from '@/lib/actions/general.actions'
import React from 'react'
import { redirect } from 'next/navigation'

const CreateInterviewPage = async () => {
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

  return (
    <div className="w-full mx-auto py-12 px-4 bg-dark-300">
      <h1 className="text-4xl font-bold text-primary-100 mb-4 text-center">Create Interview Structure</h1>
      <p className="text-center text-primary-300 mb-12 max-w-2xl mx-auto">
        Create reusable interview templates that will be personalized for each candidate based on their resume and experience.
      </p>
      <InterviewForm user={user} />
    </div>
  )
}

export default CreateInterviewPage
