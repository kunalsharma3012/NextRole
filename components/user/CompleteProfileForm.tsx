'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { saveProfile } from '@/lib/actions/general.actions';

// Card components (you may need to create these if they don't exist)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Schemas for different profile types
const candidateProfileSchema = z.object({
  summary: z.string().min(50, 'Summary must be at least 50 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }),
  workExperience: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    isCurrentJob: z.boolean().default(false),
  })),
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    grade: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    technologies: z.array(z.string()).min(1, 'At least one technology is required'),
    liveUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
  })),
  gapYears: z.array(z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().min(1, 'Reason is required'),
    description: z.string().optional(),
  })),
});

const recruiterProfileSchema = z.object({
  companyDescription: z.string().min(100, 'Company description must be at least 100 characters'),
  sector: z.string().min(1, 'Sector is required'),
  companySize: z.string().min(1, 'Company size is required'),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url().optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }),
  founded: z.string().optional(),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
});

type CandidateProfile = z.infer<typeof candidateProfileSchema>;
type RecruiterProfile = z.infer<typeof recruiterProfileSchema>;

interface CompleteProfileFormProps {
  user: User;
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentJob: boolean;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface GapYear {
  startDate: string;
  endDate: string;
  reason: string;
  description?: string;
}

const CompleteProfileForm = ({ user }: CompleteProfileFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentTech, setCurrentTech] = useState('');
  const [currentSpecialty, setCurrentSpecialty] = useState('');

  const isRecruiter = user.isRecruiter;

  const form = useForm<CandidateProfile | RecruiterProfile>({
    resolver: zodResolver(isRecruiter ? recruiterProfileSchema : candidateProfileSchema),
    defaultValues: isRecruiter ? {
      companyDescription: '',
      sector: '',
      companySize: '',
      location: '',
      website: '',
      socialLinks: { linkedin: '', twitter: '' },
      founded: '',
      specialties: [],
    } : {
      summary: '',
      skills: [],
      socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
      workExperience: [],
      education: [],
      projects: [],
      gapYears: [],
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = form;

  const onSubmit = async (data: CandidateProfile | RecruiterProfile) => {
    setIsSubmitting(true);
    try {
      const result = await saveProfile(user.id, data);
      
      if (result.success) {
        toast.success(result.message);
        router.push(`/user/${user.id}/profile`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for dynamic arrays
  const addSkill = () => {
    if (currentSkill.trim()) {
      const skills = getValues('skills') as string[] || [];
      setValue('skills', [...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const skills = getValues('skills') as string[] || [];
    setValue('skills', skills.filter((_, i) => i !== index));
  };

  const addSpecialty = () => {
    if (currentSpecialty.trim()) {
      const specialties = getValues('specialties') as string[] || [];
      setValue('specialties', [...specialties, currentSpecialty.trim()]);
      setCurrentSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const specialties = getValues('specialties') as string[] || [];
    setValue('specialties', specialties.filter((_, i) => i !== index));
  };

  const addWorkExperience = () => {
    const workExperience = getValues('workExperience') as WorkExperience[] || [];
    setValue('workExperience', [...workExperience, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentJob: false,
    }]);
  };

  const removeWorkExperience = (index: number) => {
    const workExperience = getValues('workExperience') as WorkExperience[] || [];
    setValue('workExperience', workExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const education = getValues('education') as Education[] || [];
    setValue('education', [...education, {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
    }]);
  };

  const removeEducation = (index: number) => {
    const education = getValues('education') as Education[] || [];
    setValue('education', education.filter((_, i) => i !== index));
  };

  const addProject = () => {
    const projects = getValues('projects') as Project[] || [];
    setValue('projects', [...projects, {
      name: '',
      description: '',
      technologies: [],
      liveUrl: '',
      githubUrl: '',
    }]);
  };

  const removeProject = (index: number) => {
    const projects = getValues('projects') as Project[] || [];
    setValue('projects', projects.filter((_, i) => i !== index));
  };

  const addTechToProject = (projectIndex: number) => {
    if (currentTech.trim()) {
      const projects = getValues('projects') as Project[] || [];
      projects[projectIndex].technologies = [...(projects[projectIndex].technologies || []), currentTech.trim()];
      setValue('projects', projects);
      setCurrentTech('');
    }
  };

  const removeTechFromProject = (projectIndex: number, techIndex: number) => {
    const projects = getValues('projects') as Project[] || [];
    projects[projectIndex].technologies = projects[projectIndex].technologies.filter((_, i: number) => i !== techIndex);
    setValue('projects', projects);
  };

  const addGapYear = () => {
    const gapYears = getValues('gapYears') as GapYear[] || [];
    setValue('gapYears', [...gapYears, {
      startDate: '',
      endDate: '',
      reason: '',
      description: '',
    }]);
  };

  const removeGapYear = (index: number) => {
    const gapYears = getValues('gapYears') as GapYear[] || [];
    setValue('gapYears', gapYears.filter((_, i) => i !== index));
  };

  if (isRecruiter) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Description */}
        <Card>
          <CardHeader>
            <CardTitle>Company Description</CardTitle>
            <CardDescription>Tell candidates about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  {...register('companyDescription')}
                  placeholder="Describe your company, mission, and values..."
                  className="min-h-[120px]"
                />
                {errors.companyDescription && (
                  <p className="text-sm text-red-500">{errors.companyDescription.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Basic information about your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  {...register('sector')}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
                {errors.sector && (
                  <p className="text-sm text-red-500">{errors.sector.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Input
                  id="companySize"
                  {...register('companySize')}
                  placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                />
                {errors.companySize && (
                  <p className="text-sm text-red-500">{errors.companySize.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="e.g., San Francisco, CA"
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="founded">Founded</Label>
                <Input
                  id="founded"
                  {...register('founded')}
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
            <CardDescription>What does your company specialize in?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentSpecialty}
                  onChange={(e) => setCurrentSpecialty(e.target.value)}
                  placeholder="e.g., Web Development, AI/ML, Cloud Computing"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(watch('specialties') as string[] || []).map((specialty, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                    <span className="text-sm">{specialty}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect with candidates on social media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register('socialLinks.linkedin')}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  {...register('socialLinks.twitter')}
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
        </Button>
      </form>
    );
  }

  // Candidate form
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>Tell employers about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Write a brief summary of your experience, skills, and career goals..."
              className="min-h-[120px]"
            />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add your technical and soft skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="e.g., React, Node.js, Python"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(watch('skills') as string[] || []).map((skill, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Add your work history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(watch('workExperience') as WorkExperience[] || []).map((_, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">Experience {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeWorkExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`workExperience.${index}.company`}>Company</Label>
                    <Input
                      {...register(`workExperience.${index}.company`)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`workExperience.${index}.position`}>Position</Label>
                    <Input
                      {...register(`workExperience.${index}.position`)}
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`workExperience.${index}.startDate`}>Start Date</Label>
                    <Input
                      {...register(`workExperience.${index}.startDate`)}
                      type="month"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`workExperience.${index}.endDate`}>End Date</Label>
                    <Input
                      {...register(`workExperience.${index}.endDate`)}
                      type="month"
                      disabled={watch(`workExperience.${index}.isCurrentJob`)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`workExperience.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`workExperience.${index}.description`)}
                    placeholder="Describe your role and achievements..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register(`workExperience.${index}.isCurrentJob`)}
                    id={`workExperience.${index}.isCurrentJob`}
                  />
                  <Label htmlFor={`workExperience.${index}.isCurrentJob`}>
                    I currently work here
                  </Label>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addWorkExperience} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Work Experience
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
          <CardDescription>Add your educational background</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(watch('education') as Education[] || []).map((_, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">Education {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`education.${index}.institution`}>Institution</Label>
                    <Input
                      {...register(`education.${index}.institution`)}
                      placeholder="University/College name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`education.${index}.degree`}>Degree</Label>
                    <Input
                      {...register(`education.${index}.degree`)}
                      placeholder="Bachelor's, Master's, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`education.${index}.fieldOfStudy`}>Field of Study</Label>
                    <Input
                      {...register(`education.${index}.fieldOfStudy`)}
                      placeholder="Computer Science, Business, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`education.${index}.grade`}>Grade/GPA</Label>
                    <Input
                      {...register(`education.${index}.grade`)}
                      placeholder="3.8/4.0 or 85%"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`education.${index}.startDate`}>Start Date</Label>
                    <Input
                      {...register(`education.${index}.startDate`)}
                      type="month"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`education.${index}.endDate`}>End Date</Label>
                    <Input
                      {...register(`education.${index}.endDate`)}
                      type="month"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addEducation} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Showcase your work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(watch('projects') as Project[] || []).map((project, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">Project {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`projects.${index}.name`}>Project Name</Label>
                    <Input
                      {...register(`projects.${index}.name`)}
                      placeholder="Project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`projects.${index}.liveUrl`}>Live URL</Label>
                    <Input
                      {...register(`projects.${index}.liveUrl`)}
                      placeholder="https://yourproject.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`projects.${index}.description`}>Description</Label>
                    <Textarea
                      {...register(`projects.${index}.description`)}
                      placeholder="Describe your project..."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`projects.${index}.githubUrl`}>GitHub URL</Label>
                    <Input
                      {...register(`projects.${index}.githubUrl`)}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
                <div>
                  <Label>Technologies Used</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentTech}
                      onChange={(e) => setCurrentTech(e.target.value)}
                      placeholder="e.g., React, Node.js"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechToProject(index))}
                    />
                    <Button type="button" onClick={() => addTechToProject(index)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(project.technologies || []).map((tech: string, techIndex: number) => (
                      <div key={techIndex} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                        <span className="text-sm">{tech}</span>
                        <button
                          type="button"
                          onClick={() => removeTechFromProject(index, techIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addProject} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gap Years */}
      <Card>
        <CardHeader>
          <CardTitle>Gap Years (Optional)</CardTitle>
          <CardDescription>Explain any gaps in your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(watch('gapYears') as GapYear[] || []).map((_, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">Gap Year {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeGapYear(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`gapYears.${index}.startDate`}>Start Date</Label>
                    <Input
                      {...register(`gapYears.${index}.startDate`)}
                      type="month"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`gapYears.${index}.endDate`}>End Date</Label>
                    <Input
                      {...register(`gapYears.${index}.endDate`)}
                      type="month"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`gapYears.${index}.reason`}>Reason</Label>
                    <Input
                      {...register(`gapYears.${index}.reason`)}
                      placeholder="e.g., Personal reasons, Travel, Health"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`gapYears.${index}.description`}>Description (Optional)</Label>
                  <Textarea
                    {...register(`gapYears.${index}.description`)}
                    placeholder="Provide more details if needed..."
                  />
                </div>
              </div>
            ))}
            <Button type="button" onClick={addGapYear} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Gap Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect with potential employers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                {...register('socialLinks.linkedin')}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                {...register('socialLinks.github')}
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                {...register('socialLinks.portfolio')}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                {...register('socialLinks.twitter')}
                placeholder="https://twitter.com/yourusername"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Complete Profile'}
      </Button>
    </form>
  );
};

export default CompleteProfileForm;
