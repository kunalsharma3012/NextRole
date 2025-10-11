import React from 'react'
import Image from 'next/image'

import DisplayTechIcons from '../shared/DisplayTechIcons'
import { Button } from '../ui/button'
import dayjs from "dayjs"

import { getTechLogos } from '@/lib/utils'
import Link from 'next/link'
import { getFeedbackByInterviewId, getAverageInterviewRating } from '@/lib/actions/general.actions'
import { getCurrentUser ,getUserById } from '@/lib/actions/auth.action'
import ProfileCheckWrapper from '../shared/ProfileCheckWrapper'


const InterviewCard = async ({id , userId , role,type ,techstack , createdAt }:InterviewCardProps) => {

    const user = await getCurrentUser();
    const feedback = user?.id && id ? await getFeedbackByInterviewId({interviewId : id , userId : user?.id}) : null ;
    const normalizedType=  /mix/gi.test(type)?"Mixed":type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt|| Date.now()).format("MMM D, YYYY");

    const creator = userId && user?.id !== userId ? await getUserById(userId) : null;
    const creatorName = creator?.name;
    
    // Get average rating for this interview
    const ratingData = id ? await getAverageInterviewRating(id) : null;
    const averageRating = ratingData?.success ? ratingData.averageRating.toFixed(1) : '0.0';

    // Check if user is the owner of this interview
    const isOwner = user?.id === userId;

    // Get tech icons for the tech stack
    const techIcons = await getTechLogos(techstack || []);

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96" >
      <div className="card-interview" >
        <div>
          <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600' >
            <p className='badge-text' >{normalizedType}</p>
          </div>

          {creatorName && (
            <div className='absolute top-0 left-0 w-fit px-4 py-2 rounded-br-lg bg-light-600 hover:bg-light-500 transition-colors'>
              <Link href={`/user/${userId}`} className='badge-text flex items-center gap-1'>
                <span>By {creatorName}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </Link>
            </div>
          )}

          {/* Add Edit Icon for interview owner */}
          {isOwner && (
            <div className='absolute top-12 right-4 flex flex-col gap-2'>
              <Link href={`/interview/${id}/edit`} title="Edit Interview" className="cursor-pointer hover:opacity-80 transition-opacity">
                <Image src="/edit.webp" alt="edit" width={60} height={60} />
              </Link>
              <Link href={`/interview/${id}/analytics`} title="View Analytics" className="cursor-pointer hover:opacity-80 transition-opacity">
                <div className="bg-primary-200/20 rounded-full p-2 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                </div>
              </Link>
            </div>
          )}

          <Image 
            src={techstack && techstack.length > 0 ? (await getTechLogos([techstack[Math.floor(Math.random() * techstack.length)]]))[0].url : '/tech.svg'} 
            alt="tech logo" 
            width={90} 
            height={90} 
            className="rounded-full object-fit size-[90px]" 
          />

          <h3 className='mt-5 capitalize' >
            {role} Interview
          </h3>

          <div className="flex flex-row gap-5 mt-3" >
            <div className="flex flex-row gap-2" >
              <Image src="/calendar.svg" alt='calendar' width={22} height={22} /> 
              <p>{formattedDate}</p>
            </div>
            
            <div className="flex flex-row gap-2 items-center">
              <Image src="/marks.png" alt="marks" width={22} height={22} />

              <p>{feedback?.totalScore || '---'}/100</p>

            </div>
          
          </div>

          <p className='line-clamp-2 mt-5' >{feedback?.finalAssessment || "You haven't taken the interview yet. Take it now to improve your skills"}</p>

        </div>

        <div className='flex flex-row justify-between' >
          <DisplayTechIcons techIcons={techIcons} />
          
          {/* Average Rating Display */}
          <div className="flex flex-row items-center gap-1 mx-2">
            <Image src="/star.svg" alt="rating" width={22} height={22} />
            <p className="text-sm font-medium">{averageRating}</p>
          </div>
          
          {!feedback ? (
            <ProfileCheckWrapper 
              userId={user?.id || ''} 
              targetUrl={`/interview/${id}`}
            >
              <Button className="btn-primary">
                Take Interview
              </Button>
            </ProfileCheckWrapper>
          ) : (
            <Button className="btn-secondary">
              <Link href={`/interview/${id}/feedback`}>
                Check Feedback
              </Link>
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

export default InterviewCard