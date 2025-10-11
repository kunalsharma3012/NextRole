'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  AlertCircle,
  Settings,
  Play
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  text: string;
  isEditing: boolean;
  isNew: boolean;
}

interface InterviewFormData {
  interviewCategory: 'mock' | 'job';
  role: string;
  level: 'entry' | 'mid' | 'senior';
  type: 'behavioural' | 'technical' | 'mixed';
  techstack: string;
  amount: number;
  visibility: boolean;
  userid: string;
  jobTitle?: string;
  responsibilities?: string;
  ctc?: string;
  location?: string;
  designation?: string;
}

interface QuestionsManagerProps {
  user: User;
}

const QuestionsManager = ({ }: QuestionsManagerProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState<InterviewFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('interviewFormData');
    if (savedFormData) {
      const data = JSON.parse(savedFormData);
      setFormData(data);
    } else {
      // Redirect back to interview form if no data found
      router.push('/interview');
    }
  }, [router]);

  const generateQuestions = useCallback(async () => {
    if (!formData) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/vapi/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        const newQuestions = data.questions.map((question: string, index: number) => ({
          id: `q-${index}`,
          text: question,
          isEditing: false,
          isNew: false,
        }));
        setQuestions(newQuestions);
        toast.success('Questions generated successfully!');
      } else {
        toast.error('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('An error occurred while generating questions.');
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  // Generate initial questions
  useEffect(() => {
    if (formData && questions.length === 0) {
      generateQuestions();
    }
  }, [formData, questions.length, generateQuestions]);

  const regenerateQuestions = async () => {
    if (!formData) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/vapi/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          regenerate: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        const newQuestions = data.questions.map((question: string, index: number) => ({
          id: `q-${index}`,
          text: question,
          isEditing: false,
          isNew: false,
        }));
        setQuestions(newQuestions);
        toast.success('Questions regenerated successfully!');
      } else {
        toast.error('Failed to regenerate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating questions:', error);
      toast.error('An error occurred while regenerating questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditQuestion = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isEditing: true } : q
    ));
  };

  const saveQuestion = (id: string, newText: string) => {
    if (newText.trim() === '') {
      toast.error('Question cannot be empty.');
      return;
    }

    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text: newText, isEditing: false } : q
    ));
    toast.success('Question updated successfully!');
  };

  const cancelEdit = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isEditing: false } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success('Question deleted successfully!');
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      text: '',
      isEditing: true,
      isNew: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const finalizeInterview = async () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question before finalizing.');
      return;
    }

    if (!formData) {
      toast.error('Interview data not found. Please start over.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vapi/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          questions: questions.map(q => q.text),
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('interviewFormData');
        toast.success('Interview created successfully!');
        router.push('/');
      } else {
        toast.error('Failed to create interview. Please try again.');
      }
    } catch (error) {
      console.error('Error finalizing interview:', error);
      toast.error('An error occurred while creating the interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-primary-300 mb-4" />
          <p className="text-primary-300">Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="bg-dark-100/30 rounded-xl border border-dark-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-100">Interview Settings</h2>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-dark-100/50 border-dark-100 text-primary-100 hover:bg-dark-100/70"
          >
            <Settings size={16} className="mr-2" />
            {showSettings ? 'Hide' : 'Show'} Details
          </Button>
        </div>
        
        {showSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Category</p>
              <p className="text-primary-100 font-medium capitalize">{formData.interviewCategory}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Role</p>
              <p className="text-primary-100 font-medium">{formData.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Level</p>
              <p className="text-primary-100 font-medium capitalize">{formData.level}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Type</p>
              <p className="text-primary-100 font-medium capitalize">{formData.type}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Tech Stack</p>
              <p className="text-primary-100 font-medium">{formData.techstack}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-primary-300">Questions</p>
              <p className="text-primary-100 font-medium">{questions.length}</p>
            </div>
            {formData.interviewCategory === 'job' && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-primary-300">Job Title</p>
                  <p className="text-primary-100 font-medium">{formData.jobTitle}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-primary-300">Location</p>
                  <p className="text-primary-100 font-medium">{formData.location}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-primary-300">CTC</p>
                  <p className="text-primary-100 font-medium">{formData.ctc}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Questions Management */}
      <div className="bg-dark-100/30 rounded-xl border border-dark-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary-100">
            Interview Questions ({questions.length})
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={addNewQuestion}
              className="bg-primary-200 hover:bg-primary-200/80 text-dark-300"
            >
              <Plus size={16} className="mr-2" />
              Add Question
            </Button>
            <Button
              onClick={regenerateQuestions}
              disabled={isGenerating}
              variant="outline"
              className="bg-dark-100/50 border-dark-100 text-primary-100 hover:bg-dark-100/70"
            >
              <RefreshCw size={16} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Regenerating...' : 'Regenerate All'}
            </Button>
          </div>
        </div>

        {isGenerating && questions.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 text-primary-200 animate-spin mb-4" />
            <p className="text-primary-300">Generating questions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onEdit={startEditQuestion}
                onSave={saveQuestion}
                onCancel={cancelEdit}
                onDelete={deleteQuestion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => router.push('/interview')}
          variant="outline"
          className="bg-dark-100/50 border-dark-100 text-primary-100 hover:bg-dark-100/70"
        >
          Back to Settings
        </Button>
        
        <Button
          onClick={finalizeInterview}
          disabled={isSubmitting || questions.length === 0}
          className="bg-primary-200 hover:bg-primary-200/80 text-dark-300 px-8"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Creating Interview...
            </>
          ) : (
            <>
              <Play size={16} className="mr-2" />
              Create Interview
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (id: string) => void;
  onSave: (id: string, text: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

const QuestionCard = ({ question, index, onEdit, onSave, onCancel, onDelete }: QuestionCardProps) => {
  const [editText, setEditText] = useState(question.text);

  const handleSave = () => {
    onSave(question.id, editText);
  };

  const handleCancel = () => {
    setEditText(question.text);
    onCancel(question.id);
  };

  return (
    <div className="bg-dark-100/50 rounded-lg border border-dark-100 p-4 hover:border-primary-200/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary-300 bg-dark-100/50 px-2 py-1 rounded">
              Q{index + 1}
            </span>
            {question.isNew && (
              <span className="text-xs font-medium text-green-400 bg-green-400/20 px-2 py-1 rounded">
                New
              </span>
            )}
          </div>
          
          {question.isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-dark-100/50 border-dark-100 focus:border-primary-200 text-primary-100 rounded-lg resize-none"
                rows={3}
                placeholder="Enter your question..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save size={14} className="mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="bg-dark-100/50 border-dark-100 text-primary-100 hover:bg-dark-100/70"
                >
                  <X size={14} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-primary-100 text-sm leading-relaxed">
              {question.text || 'Empty question'}
            </p>
          )}
        </div>

        {!question.isEditing && (
          <div className="flex gap-1 ml-3">
            <Button
              onClick={() => onEdit(question.id)}
              size="sm"
              variant="outline"
              className="bg-dark-100/50 border-dark-100 text-primary-100 hover:bg-dark-100/70 p-2"
            >
              <Edit3 size={14} />
            </Button>
            <Button
              onClick={() => onDelete(question.id)}
              size="sm"
              variant="outline"
              className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 p-2"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsManager;
