'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import DisplayTechIcons from './DisplayTechIcons';
import dayjs from "dayjs";
import { getTechLogos } from '@/lib/utils';

interface InterviewStructureCardProps {
  id: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  interviewCategory: 'mock' | 'job';
  compulsoryQuestions: number;
  personalizedQuestions: number;
  usageCount: number;
  createdAt: string;
  jobTitle?: string;
  location?: string;
  ctc?: string;
}

const InterviewStructureCard = ({
  id,
  role,
  level,
  type,
  techstack,
  interviewCategory,
  compulsoryQuestions,
  personalizedQuestions,
  usageCount,
  createdAt,
  jobTitle,
  location,
  ctc
}: InterviewStructureCardProps) => {
  const [techLogo, setTechLogo] = useState('/tech.svg');
  const [techIcons, setTechIcons] = useState<Array<{ tech: string; url: string }>>([]);

  useEffect(() => {
    const loadTechData = async () => {
      if (techstack.length > 0) {
        try {
          // Load tech logo
          const logos = await getTechLogos([techstack[Math.floor(Math.random() * techstack.length)]]);
          if (logos.length > 0) {
            setTechLogo(logos[0].url);
          }

          // Load tech icons
          const icons = await getTechLogos(techstack);
          setTechIcons(icons);
        } catch (error) {
          console.error('Error loading tech data:', error);
          setTechLogo('/tech.svg');
          setTechIcons([]);
        }
      }
    };

    loadTechData();
  }, [techstack]);

  const totalQuestions = compulsoryQuestions + personalizedQuestions;
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(createdAt).format("MMM D, YYYY");

  const handleTakeInterview = () => {
    window.location.href = `/interview/confirm-profile?structureId=${id}`;
  };

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
            <p className='badge-text'>{normalizedType}</p>
          </div>

          {/* Tech Logo */}
          <Image 
            src={techLogo} 
            alt="tech logo" 
            width={90} 
            height={90} 
            className="rounded-full object-fit size-[90px]" 
          />

          {/* Title */}
          <h3 className='mt-5 capitalize'>
            {interviewCategory === 'job' && jobTitle ? `${jobTitle} Interview` : `${role} Interview`}
          </h3>

          {/* Interview Details */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" alt='calendar' width={22} height={22} /> 
              <p>{formattedDate}</p>
            </div>
            
            <div className="flex flex-row gap-2 items-center">
              <Image src="/marks.png" alt="questions" width={22} height={22} />
              <p>{totalQuestions} questions</p>
            </div>
          </div>

          {/* Description */}
          <p className='line-clamp-2 mt-5'>
            {interviewCategory === 'job' && jobTitle && jobTitle !== role ? 
              `${level === 'entry' ? 'Entry' : level === 'mid' ? 'Mid' : 'Senior'} level ${type} interview for ${role} position.` :
              `${level === 'entry' ? 'Entry' : level === 'mid' ? 'Mid' : 'Senior'} level ${type} interview structure with ${compulsoryQuestions} compulsory and ${personalizedQuestions} personalized questions.`
            }
            {location && ` Location: ${location}.`}
            {ctc && ` CTC: ${ctc}.`}
          </p>
        </div>

        {/* Footer */}
        <div className='flex flex-row justify-between items-center'>
          <DisplayTechIcons techIcons={techIcons} />
          
          {/* Usage Count */}
          <div className="flex flex-row items-center gap-1 mx-2">
            <Image src="/star.svg" alt="usage" width={22} height={22} />
            <p className="text-sm font-medium">{usageCount}</p>
          </div>
          
          <Button 
            onClick={handleTakeInterview}
            className="btn-primary"
          >
            Take Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewStructureCard;
