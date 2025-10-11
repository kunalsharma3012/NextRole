import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.actions';

import { redirect } from "next/navigation";
import FeedbackWithRating from '@/components/interview/FeedbackWithRating';

import React from 'react'

const page = async({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const queryParams = await searchParams;
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }
  
  const interview = await getInterviewById(id);
  if (!interview) {
    redirect('/');
  }

  // Check if a specific userId is provided in the query parameters
  const targetUserId = queryParams.userId || currentUser.id;
  
  // If viewing someone else's feedback, verify the current user is the interview owner
  if (targetUserId !== currentUser.id && interview.userId !== currentUser.id) {
    redirect('/');
  }
  
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: targetUserId,
  });

  if (!feedback) {
    redirect('/');
  }

  return (
    <>
      <FeedbackWithRating feedback={feedback} interview={interview} id={id} isOwner={currentUser.id===targetUserId} />
    </>
  )
}

export default page