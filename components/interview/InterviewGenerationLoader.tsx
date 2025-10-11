'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

interface InterviewGenerationLoaderProps {
  user: User;
  structureId: string;
}

const InterviewGenerationLoader = ({ user, structureId }: InterviewGenerationLoaderProps) => {
  const router = useRouter();
  const [loadingStage, setLoadingStage] = useState(1);
  const [loadingText, setLoadingText] = useState('Fetching interview structure...');
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGeneratedRef = useRef(false);

  const loadingStagesData = [
    { stage: 1, text: 'Fetching interview structure...', duration: 2000 },
    { stage: 2, text: 'Analyzing your profile and role requirements...', duration: 3000 },
    { stage: 3, text: 'Generating personalized questions using custom prompt...', duration: 4000 },
    { stage: 4, text: 'Validating question count and quality...', duration: 2000 },
    { stage: 5, text: 'Finalizing your interview...', duration: 1000 }
  ];

  useEffect(() => {
    // Prevent duplicate generation using ref
    if (hasGeneratedRef.current) return;
    
    // Check sessionStorage to prevent duplicate generation on page refresh/navigation
    const generationKey = `generating_${structureId}_${user.id}`;
    const isAlreadyGenerating = sessionStorage.getItem(generationKey);
    
    if (isAlreadyGenerating) {
      console.log('Interview generation already in progress');
      return;
    }
    
    // Mark as generating in sessionStorage
    sessionStorage.setItem(generationKey, 'true');
    hasGeneratedRef.current = true;

    const loadingStages = [
      { stage: 1, text: 'Fetching interview structure...', duration: 2000 },
      { stage: 2, text: 'Analyzing your profile and role requirements...', duration: 3000 },
      { stage: 3, text: 'Generating personalized questions using custom prompt...', duration: 4000 },
      { stage: 4, text: 'Validating question count and quality...', duration: 2000 },
      { stage: 5, text: 'Finalizing your interview...', duration: 1000 }
    ];

    const generateInterview = async () => {
      // Additional check to prevent duplicate calls
      if (isGenerating) return;
      setIsGenerating(true);
      
      try {
        // Simulate loading stages
        for (const { stage, text, duration } of loadingStages) {
          setLoadingStage(stage);
          setLoadingText(text);
          await new Promise(resolve => setTimeout(resolve, duration));
        }

        // Actually generate the interview
        const response = await fetch('/api/vapi/take-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            structureId,
            userId: user.id,
            generatePersonalized: true,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Clear the generation flag on success
          sessionStorage.removeItem(generationKey);
          toast.success('Interview generated successfully!');
          router.push(`/interview/${data.interviewId}`);
        } else {
          // Clear the generation flag on error
          sessionStorage.removeItem(generationKey);
          toast.error(data.error || 'Failed to generate interview');
          router.push('/');
        }
      } catch (error) {
        // Clear the generation flag on error
        sessionStorage.removeItem(generationKey);
        console.error('Error generating interview:', error);
        toast.error('An error occurred while generating the interview');
        router.push('/');
      } finally {
        setIsGenerating(false);
      }
    };

    generateInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to prevent re-runs

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gradient-to-br from-dark-300 via-dark-200/90 to-dark-300 rounded-2xl border border-dark-100 p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-100 mb-4">
            Generating Your Interview
          </h1>
          <p className="text-primary-300 text-lg">
            Please wait while we create a personalized interview experience for you
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200/30 rounded-full animate-spin border-t-primary-200"></div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary-100">
              {loadingText}
            </h3>
            
            {/* Progress Bar */}
            <div className="w-full bg-dark-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-300 to-primary-200 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(loadingStage / loadingStagesData.length) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-primary-400 text-sm">
              Stage {loadingStage} of {loadingStagesData.length}
            </p>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3">
          {loadingStagesData.map(({ stage, text }) => (
            <div 
              key={stage}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                stage <= loadingStage 
                  ? 'bg-primary-200/20 text-primary-100' 
                  : 'bg-dark-100/30 text-primary-400'
              }`}
            >
              <span className="text-sm">{text}</span>
              <div className={`w-4 h-4 rounded-full ${
                stage < loadingStage 
                  ? 'bg-green-500' 
                  : stage === loadingStage 
                    ? 'bg-primary-200 animate-pulse' 
                    : 'bg-dark-100'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              💡
            </div>
            <div className="text-left">
              <h4 className="text-blue-800 font-medium mb-1">What&apos;s happening?</h4>
              <p className="text-blue-700 text-sm">
                Our AI is analyzing your profile, the interview structure&apos;s personalized prompt, and role requirements to create questions that are 
                specifically tailored to your background, skills, and the exact number specified in the interview structure. This ensures a 
                highly relevant and customized interview experience.
              </p>
            </div>
          </div>
        </div>

        {/* Don't close warning */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Please don&apos;t close this page while your interview is being generated
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewGenerationLoader;
