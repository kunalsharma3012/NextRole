import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import { db } from '@/firebase/admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getAllFeedbackForInterview(interviewId: string): Promise<(Feedback & { userName: string })[]> {
  try {
    // Get all feedback documents for this interview
    const feedbackSnapshot = await db.collection('feedback')
      .where('interviewId', '==', interviewId)
      .get();
    
    if (feedbackSnapshot.empty) {
      return [];
    }
    
    // Get feedback with user information
    const feedbackWithUserInfo = await Promise.all(
      feedbackSnapshot.docs.map(async (doc) => {
        const feedbackData = doc.data() as Feedback;
        feedbackData.id = doc.id;
        
        // Get user information
        let userName = 'Unknown User';
        if (feedbackData.userId) {
          const userDoc = await db.collection('users').doc(feedbackData.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data() as User;
            userName = userData.name;
          }
        }
        
        return { ...feedbackData, userName };
      })
    );
    
    // Sort by score (highest first)
    return feedbackWithUserInfo.sort((a, b) => b.totalScore - a.totalScore);
  } catch (error) {
    console.error('Error fetching feedback for interview:', error);
    return [];
  }
}

const InterviewAnalyticsPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  
  // Redirect if not authenticated
  if (!currentUser) {
    redirect('/sign-in');
  }
  
  // Get interview details
  const interview = await getInterviewById(id);
  
  if (!interview) {
    redirect('/');
  }
  
  // Check if current user is the owner of the interview
  const isOwner = currentUser.id === interview.userId;
  
  // If not the owner, redirect to home
  if (!isOwner) {
    redirect('/');
  }
  
  // Get all feedback for this interview
  const feedbackList = await getAllFeedbackForInterview(id);
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="card-border w-full mb-8">
        <div className="dark-gradient rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Analytics for {interview.role} Interview</h1>
          <p className="text-light-400 mb-4">View all users who have taken this interview</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20 shadow-md">
              <div className="text-primary-300 text-sm mb-1">Total Attempts</div>
              <div className="text-2xl font-bold text-primary-100">{feedbackList.length}</div>
            </div>
            
            <div className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20 shadow-md">
              <div className="text-primary-300 text-sm mb-1">Average Score</div>
              <div className="text-2xl font-bold text-primary-100">
                {feedbackList.length > 0 
                  ? Math.round(feedbackList.reduce((sum, feedback) => sum + feedback.totalScore, 0) / feedbackList.length) 
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-semibold text-primary-100">Interview Attempts</h2>
          </div>
          <div className="flex-grow h-px bg-gradient-to-r from-primary-500/20 to-transparent"></div>
        </div>
        
        {feedbackList.length > 0 ? (
          <div className="grid gap-4">
            {feedbackList.map((feedback) => (
              <div key={feedback.id} className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20 shadow-md hover:border-primary-500/40 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <Link href={`/user/${feedback.userId}`} className="text-xl font-semibold text-primary-100 hover:text-primary-200 transition-colors">
                      {feedback.userName}
                    </Link>
                    <p className="text-light-400 text-sm">
                      Taken on {new Date(feedback.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-light-400">Score</div>
                      <Link href={`/interview/${id}/feedback?userId=${feedback.userId}`} className="text-2xl font-bold text-primary-200 hover:text-primary-100 transition-colors">
                        {feedback.totalScore}/100
                      </Link>
                    </div>
                    
                    <Button asChild className="btn-primary">
                      <Link href={`/interview/${id}/feedback?userId=${feedback.userId}`}>
                        View Feedback
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="blue-gradient-dark rounded-lg border-2 border-primary-200/30 p-8 text-center">
            <p className="text-light-400 mb-4">No one has taken this interview yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewAnalyticsPage;