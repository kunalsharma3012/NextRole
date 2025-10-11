import React from 'react'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getPublicInterviewStructures } from '@/lib/actions/general.actions'
import { HeroSection, InterviewSection } from '@/components/home'

const page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please sign in to view interviews</div>;
  }

  const publicStructures = await getPublicInterviewStructures(6, 6); // Limit to 6 each for better UI

  return (
    <>
      {/* Hero Section */}
      <HeroSection user={user} />

      {/* Mock Interview Section */}
      <InterviewSection
        title={"Popular Mock Interviews"}
        interviews={publicStructures.mockStructures || []}
        interviewCategory="mock"
        userId={user.id}
        emptyStateTitle={user.isRecruiter ? "No mock interviews available" : "No practice sessions available"}
        emptyStateDescription={user.isRecruiter 
          ? "Create engaging mock interviews with AI feedback to help candidates prepare for real opportunities."
          : "Start practicing with mock interviews to build confidence and improve your interview skills."
        }
        showCreateButton={true}
      />

      {/* Job Interview Section */}
      <InterviewSection
        title="Active Job Interviews"
        interviews={publicStructures.jobStructures || []}
        interviewCategory="job"
        emptyStateTitle={user.isRecruiter ? "No job interviews created" : "No job opportunities available"}
        emptyStateDescription={user.isRecruiter 
          ? "Launch intelligent job interviews with real-time analytics and automated candidate evaluation."
          : "Discover exciting job openings and interview opportunities from top companies hiring now."
        }
        showCreateButton={user.isRecruiter}
      />
    </>
  )
}

export default page