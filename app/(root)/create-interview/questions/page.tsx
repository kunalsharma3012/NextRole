import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import QuestionsManager from '@/components/shared/QuestionsManager';

const QuestionsPage = async () => {
  const user = await getCurrentUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="w-full mx-auto py-12 px-4 bg-dark-300 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-100 mb-4 text-center">
          Interview Questions
        </h1>
        <p className="text-center text-primary-300 mb-12 max-w-2xl mx-auto">
          Generate, review, and customize your interview questions before finalizing your interview structure.
        </p>
        <QuestionsManager user={user} />
      </div>
    </div>
  );
};

export default QuestionsPage;
