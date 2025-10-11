'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { updateInterview } from '@/lib/actions/general.actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EditInterviewProps {
  interview: Interview;
  techLogo: string;
  id: string;
  userId: string; // Add userId prop
}

export default function EditInterview({ interview, techLogo, id, userId }: EditInterviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role] = useState(interview.role); // No setter function as role shouldn't be editable
  const [questions, setQuestions] = useState<string[]>(interview.questions);
  const [isPublic, setIsPublic] = useState<boolean>(interview.visibility !== false); // Default to true if not set
  
  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };
  
  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };
  
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questions.length === 0) {
      toast.error('You must have at least one question');
      return;
    }
    
    // Filter out empty questions
    const filteredQuestions = questions.filter(q => q.trim() !== '');
    
    if (filteredQuestions.length === 0) {
      toast.error('You must have at least one non-empty question');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the server action instead of fetch API
      const result = await updateInterview({
        id,
        role, // We're still sending the original role
        questions: filteredQuestions,
        userId,
        visibility: isPublic // Send the visibility status
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update interview');
      }
      
      toast.success('Interview updated successfully');
      router.push(`/`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update interview');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 animate-fadeIn">
      <div className="card-border w-full">
        <div className="dark-gradient rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-primary-100">Edit Interview</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="blue-gradient-dark rounded-lg border-2 border-primary-200/30 p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="blue-gradient rounded-full p-1">
                    <Image 
                      src={techLogo} 
                      alt="tech logo" 
                      width={90} 
                      height={90} 
                      className="rounded-full object-fit size-[90px]" 
                    />
                  </div>
                </div>
                
                <div className="flex-grow">
                  <label htmlFor="role" className="block text-lg font-medium mb-2 text-primary-100">Interview Role</label>
                  <Input 
                    id="role"
                    type="text" 
                    value={role} 
                    readOnly
                    className="!bg-dark-300 !rounded-full !min-h-12 !px-5 w-full text-light-100 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
              
              {interview.techstack && (
                <div className="mt-6">
                  <label className="block text-lg font-medium mb-2 text-primary-100">Tech Stack</label>
                  <div className="flex flex-wrap gap-2">
                    {interview.techstack.map((tech) => (
                      <div key={tech} className="bg-dark-300 rounded-full px-3 py-1 text-sm text-light-100">
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="blue-gradient-dark rounded-lg border-2 border-primary-200/30 p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Switch 
                  id="visibility-toggle" 
                  checked={isPublic} 
                  onCheckedChange={setIsPublic}
                  // className="data-[state=checked]:bg-primary-100"
                />
                <Label htmlFor="visibility-toggle" className="text-lg font-medium text-primary-100 cursor-pointer">
                  {isPublic ? 'Public Interview' : 'Private Interview'}
                </Label>
                <div className="ml-2 text-sm text-light-400">
                  {isPublic 
                    ? 'This interview will be visible to all users' 
                    : 'This interview will only be visible to you'}
                </div>
              </div>
            </div>
            
            <div className="blue-gradient-dark rounded-lg border-2 border-primary-200/30 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-primary-100">Interview Questions</h2>
                <Button 
                  type="button" 
                  onClick={handleAddQuestion}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Question
                </Button>
              </div>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-shrink-0 text-primary-100 font-medium">{index + 1}.</div>
                    <Input
                      type="text"
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder={`Question ${index + 1}`}
                      className="!bg-dark-200 !rounded-full !min-h-12 !px-5 flex-grow placeholder:!text-light-400"
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleDeleteQuestion(index)}
                      variant="destructive"
                      className="!bg-destructive-100 !rounded-full hover:!bg-destructive-200 !min-h-10 !px-4 cursor-pointer"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className="flex-center p-6">
                    <p className="text-light-400 italic">No questions yet. Click "Add Question" to add one.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-8">
              <Button 
                type="button" 
                onClick={() => router.push(`/`)}
                className="btn-secondary cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary flex items-center gap-2 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}