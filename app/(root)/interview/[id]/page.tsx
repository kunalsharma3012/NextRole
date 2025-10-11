import Agent from '@/components/interview/Agent';
import DisplayTechIcons from '@/components/shared/DisplayTechIcons';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById, checkProfileCompletion } from '@/lib/actions/general.actions';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'

import { getTechLogos } from '@/lib/utils';

const page = async ({params} : RouteParams) => {

    const { id } = await params;
    const interview = await getInterviewById(id);
    const user = await getCurrentUser();
    
    if(!interview) redirect('/discover');
    
    // Redirect if not authenticated
    if (!user) {
        redirect('/sign-in');
    }

    // Check if profile is completed before allowing interview taking
    const isProfileCompleted = await checkProfileCompletion(user.id);
    
    if (!isProfileCompleted) {
        redirect(`/user/${user.id}/profile/complete`);
    }

    // Get user's initial for avatar and color
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
    const avatarColor = user?.avatarColor || 'bg-blue-500'; // Default to blue if no color is set

    // Ensure techstack is an array with fallback
    const techstack = interview?.techstack || [];
    
    // Get tech icons for the tech stack (only if techstack is not empty)
    const techIcons = techstack.length > 0 ? await getTechLogos(techstack) : [];

    // Combine questions for the Agent component
    // Handle both new structure (preGeneratedQuestions + personalizedQuestions) 
    // and old structure (questions) for backward compatibility
    const allQuestions = interview.preGeneratedQuestions && interview.personalizedQuestions
      ? [...interview.preGeneratedQuestions, ...interview.personalizedQuestions]
      : interview.questions || [];


  return (
    <>
        <div className='flex flex-row gap-4 justify-between' >
            <div className='flex flex-row gap-4 items-center max-sm:flex-col' >
                <div className='flex flex-row gap-4 items-center' >
                <Image 
                    src={techstack.length > 0 ? (await getTechLogos([techstack[Math.floor(Math.random() * techstack.length)]]))[0].url : '/tech.svg'} 
                    alt="tech logo" 
                    width={90} 
                    height={90} 
                    className="rounded-full object-fit size-[90px]" 
                />
                    <h3 className='capitalize' >{interview.role || 'Interview'} </h3>
                </div>

                <DisplayTechIcons techIcons={techIcons} />

            </div>

            <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize' >{interview.type || 'Interview'}</p>

        </div>

        <Agent userName={user?.name || ''} userInitial={userInitial} avatarColor={avatarColor} userId={user?.id} interviewId={id} type="interview" questions={allQuestions} />

    </>
  )
}

export default page