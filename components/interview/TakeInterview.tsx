'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InterviewStructure {
  id: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  interviewCategory: 'mock' | 'job';
  compulsoryQuestions: number;
  personalizedQuestions: number;
  usageCount: number;
  jobTitle?: string;
  location?: string;
  ctc?: string;
  createdAt: string;
  userId: string;
}

interface TakeInterviewProps {
  user: User;
  structureId?: string;
  isStructureBased?: boolean;
}

const TakeInterview = ({ user, structureId, isStructureBased = false }: TakeInterviewProps) => {
  const router = useRouter();
  const [structures] = useState<InterviewStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<InterviewStructure | null>(null);
  const [resume, setResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isStructureBased && structureId) {
      // If we have a structureId, fetch that specific structure
      fetchSpecificStructure(structureId);
    } else {
      fetchInterviewStructures();
    }
  }, [isStructureBased, structureId]);

  const fetchSpecificStructure = async (id: string) => {
    try {
      setLoading(true);
      // Create a mock structure for now - in a real app, this would fetch from the API
      const mockStructure: InterviewStructure = {
        id: id,
        role: 'Software Engineer',
        level: 'mid',
        type: 'mixed',
        techstack: ['React', 'Node.js', 'JavaScript'],
        interviewCategory: 'mock',
        compulsoryQuestions: 8,
        personalizedQuestions: 2,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        userId: 'system'
      };
      
      setSelectedStructure(mockStructure);
      setLoading(false);
      toast.info('Interview structure loaded. Please provide your resume for personalized questions.');
    } catch (error) {
      console.error('Error fetching specific structure:', error);
      setLoading(false);
      toast.error('Failed to load interview structure');
    }
  };

  const fetchInterviewStructures = async () => {
    try {
      // This would need to be implemented as an API endpoint
      // For now, we'll simulate it
      setLoading(false);
      toast.info('Feature coming soon: Browse available interview structures');
    } catch (error) {
      console.error('Error fetching structures:', error);
      setLoading(false);
    }
  };

  const handleTakeInterview = async () => {
    if (!selectedStructure) {
      toast.error('Please select an interview structure');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/vapi/take-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structureId: selectedStructure.id,
          userId: user.id,
          resume: resume.trim() || null,
          interviewCategory: selectedStructure.interviewCategory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Personalized interview generated!');
        router.push(`/interview/${data.interviewId}`);
      } else {
        toast.error(data.error || 'Failed to generate interview');
      }
    } catch (error) {
      console.error('Error generating interview:', error);
      toast.error('An error occurred while generating the interview');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-100 mb-4">Loading Interview Structures...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-primary-100 mb-4 text-center">Take an Interview</h2>
      <p className="text-primary-300 text-center mb-8">
        Select an interview structure and optionally provide your resume for personalized questions
      </p>

      {/* Resume Input */}
      <div className="mb-8 p-6 bg-dark-100/30 rounded-xl border border-dark-100">
        <h3 className="text-xl font-semibold text-primary-100 mb-4">Your Resume/Profile (Optional)</h3>
        <p className="text-primary-300 text-sm mb-4">
          Provide your resume or professional background to get more personalized interview questions.
          Leave blank for general questions based on the role.
        </p>
        <Textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume content here, or describe your professional background, skills, and experience..."
          className="bg-dark-100/50 border-dark-100 focus:border-primary-200 text-primary-100 rounded-xl min-h-[200px]"
        />
      </div>

      {/* Structure-based flow */}
      {isStructureBased && selectedStructure ? (
        <div className="space-y-6">
          {/* Selected Structure Display */}
          <div className="p-6 bg-dark-100/30 rounded-xl border border-primary-200">
            <h3 className="text-xl font-semibold text-primary-100 mb-4">Selected Interview Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-primary-100 font-medium text-lg">{selectedStructure.role}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedStructure.interviewCategory === 'job'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedStructure.interviewCategory === 'job' ? 'Job Interview' : 'Mock Interview'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-primary-400">Level:</span>
                  <span className="text-primary-200 ml-2 capitalize">
                    {selectedStructure.level === 'entry' ? 'Entry Level' : 
                     selectedStructure.level === 'mid' ? 'Mid Level' : 'Senior Level'}
                  </span>
                </div>
                <div>
                  <span className="text-primary-400">Type:</span>
                  <span className="text-primary-200 ml-2 capitalize">{selectedStructure.type}</span>
                </div>
                <div>
                  <span className="text-primary-400">Questions:</span>
                  <span className="text-primary-200 ml-2">
                    {selectedStructure.compulsoryQuestions + selectedStructure.personalizedQuestions} total
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-primary-300">
                <strong>Question Breakdown:</strong> {selectedStructure.compulsoryQuestions} compulsory + {selectedStructure.personalizedQuestions} personalized
              </div>
              
              {selectedStructure.techstack && selectedStructure.techstack.length > 0 && (
                <div className="text-sm">
                  <span className="text-primary-400">Tech Stack:</span>
                  <span className="text-primary-200 ml-2">
                    {selectedStructure.techstack.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Start Interview Button */}
          <Button
            onClick={handleTakeInterview}
            disabled={isGenerating}
            className="w-full mt-6 text-dark-300 font-bold py-4 rounded-xl text-lg"
            style={{
              background: 'linear-gradient(90deg, #cac5fe 0%, #8a82d8 50%, #dddfff 100%)',
            }}
          >
            {isGenerating ? 'Generating Personalized Interview...' : 'Start Interview'}
          </Button>
        </div>
      ) : !isStructureBased ? (
        <>
          {/* Demo Section - Since we don't have structures loaded yet */}
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-yellow-800 font-semibold mb-2">Demo Mode</h3>
            <p className="text-yellow-700 text-sm mb-4">
              The interview structure browsing feature is being implemented. 
              For now, you can create interview structures using the Create Interview page.
            </p>
            <div className="space-y-2">
              <p className="text-yellow-700 text-sm">
                <strong>Next steps to implement:</strong>
              </p>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                <li>API endpoint to fetch public interview structures</li>
                <li>Structure browsing and filtering interface</li>
                <li>Integration with actual interview taking flow</li>
                <li>Resume parsing and analysis for better personalization</li>
              </ul>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => router.push('/interview')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Interview Structure
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="text-primary-100 border-primary-200"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>

          {/* Future: Interview structures list would go here */}
          {structures.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary-100">Available Interview Structures</h3>
              {structures.map((structure) => (
                <div
                  key={structure.id}
                  className={`p-4 bg-dark-100/30 rounded-xl border transition-all cursor-pointer ${
                    selectedStructure?.id === structure.id
                      ? 'border-primary-200 bg-dark-100/50'
                      : 'border-dark-100 hover:border-primary-200/50'
                  }`}
                  onClick={() => setSelectedStructure(structure)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-primary-100 font-medium">{structure.role}</h4>
                      <p className="text-primary-300 text-sm">
                        {structure.level} • {structure.type} • {structure.compulsoryQuestions + structure.personalizedQuestions} questions
                      </p>
                      <p className="text-primary-400 text-xs mt-1">
                        Used {structure.usageCount} times
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      structure.interviewCategory === 'job'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {structure.interviewCategory === 'job' ? 'Job' : 'Mock'}
                    </span>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleTakeInterview}
                disabled={!selectedStructure || isGenerating}
                className="w-full mt-6 text-dark-300 font-bold py-4 rounded-xl text-lg"
                style={{
                  background: 'linear-gradient(90deg, #cac5fe 0%, #8a82d8 50%, #dddfff 100%)',
                }}
              >
                {isGenerating ? 'Generating Personalized Interview...' : 'Start Interview'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Interview Structure</h3>
          <p className="text-red-700 text-sm mb-4">
            Unable to load the requested interview structure. Please try again.
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default TakeInterview;
