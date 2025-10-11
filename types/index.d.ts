interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  userId?: string;
  userRating?: number;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  categorizedQuestions?: {
    behavioral: string[];
    technical: string[];
  };
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  visibility?: boolean; // Controls whether the interview is public (true) or private (false)
  interviewCategory?: 'mock' | 'job';
  jobTitle?: string;
  responsibilities?: string;
  ctc?: string;
  location?: string;
  designation?: string;
  // For actual interviews
  structureId?: string; // References the structure this interview was generated from
  personalizedForResume?: boolean;
  status?: 'ready' | 'in_progress' | 'completed';
  
  // New fields for refactored interview system
  preGeneratedQuestions?: string[];     // Compulsory questions from structure
  personalizedQuestions?: string[];     // Generated personalized questions
  userProfile?: {
    id: string;
    currentRole?: string;
    experience?: string;
    location?: string;
    phone?: string;
    summary?: string;
    skills?: string[];
    workExperience?: {
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
      isCurrentJob: boolean;
    }[];
    education?: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate: string;
      grade?: string;
    }[];
    projects?: {
      name: string;
      description: string;
      technologies: string[];
      liveUrl?: string;
      githubUrl?: string;
    }[];
    achievements?: {
      title: string;
      description: string;
      date: string;
      organization: string;
      url?: string;
    }[];
    languages?: string[];
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
      twitter?: string;
    };
    resume?: string;
  } | null;
}

// Simplified interview type that stores only essential data
interface GeneratedInterview {
  id: string;
  structureId: string;
  userId: string;
  
  // Only the questions data
  preGeneratedQuestions: string[];     // Compulsory questions from structure
  personalizedQuestions: string[];     // Generated personalized questions
  
  // User data who is taking the interview
  userProfile: {
    id: string;
    currentRole?: string;
    experience?: string;
    skills?: string;
    education?: string;
    location?: string;
    phone?: string;
    resume?: string;
  } | null;
  
  // Minimal metadata for functionality
  createdAt: string;
  status: 'ready' | 'in_progress' | 'completed';
  interviewCategory: 'mock' | 'job';
  requestId: string;
}

interface InterviewStructure {
  id: string;
  role: string;
  level: string;
  questions: string[];
  categorizedQuestions?: {
    behavioral: string[];
    technical: string[];
  };
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  visibility?: boolean;
  interviewCategory?: 'mock' | 'job';
  jobTitle?: string;
  responsibilities?: string;
  ctc?: string;
  location?: string;
  designation?: string;
  // Structure metadata
  isTemplate: true;
  compulsoryQuestions: number;
  personalizedQuestions: number;
  personalizedQuestionPrompt?: string;
  // Mixed interview breakdown
  technicalQuestions?: number;
  behavioralQuestions?: number;
  usageCount: number;
  lastUsed?: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  avatarColor?: string;
  isRecruiter: boolean;
}

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userInitial: string;
  avatarColor: string;
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  isRecruiter: boolean;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

interface UserProfile {
  currentRole?: string;
  experience?: string;
  skills?: string;
  education?: string | Education | Education[];
  location?: string;
  phone?: string;
  resume?: string;
}
