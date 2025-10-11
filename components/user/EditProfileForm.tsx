'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

// Card components
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

// Profile data interfaces
interface WorkExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrentJob: boolean | string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface Achievement {
  title: string;
  description: string;
  date: string;
  organization: string;
  url?: string;
}

interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

// Use a more flexible approach for profile data
interface ProfileData {
  // Candidate fields
  currentRole?: string;
  experience?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  workExperience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  achievements?: Achievement[];
  languages?: string[];
  socialLinks?: SocialLinks;
  
  // Recruiter fields
  companyDescription?: string;
  sector?: string;
  companySize?: string;
  founded?: string;
  website?: string;
  specialties?: string[];
}

interface EditProfileFormProps {
  user: User;
  existingProfile?: ProfileData;
  mode?: 'create' | 'edit';
}

export default function EditProfileForm({ user, existingProfile, mode = 'edit' }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Normalize the existing profile data to ensure proper boolean types
  const normalizeProfile = (profile: ProfileData | undefined): ProfileData => {
    if (!profile) return {};
    
    // Normalize work experience boolean values
    const normalizedWorkExperience = profile.workExperience?.map((exp: WorkExperience) => ({
      ...exp,
      isCurrentJob: exp.isCurrentJob === true || exp.isCurrentJob === 'true'
    }));
    
    return {
      ...profile,
      workExperience: normalizedWorkExperience
    };
  };
  
  const [formData, setFormData] = useState<ProfileData>(normalizeProfile(existingProfile));
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');

  // Helper function to safely convert boolean values
  const toBool = (value: boolean | string | undefined): boolean => {
    return value === true || value === 'true';
  };

  // Auto-save function
  const autoSave = async () => {
    if (mode === 'edit' || Object.keys(formData).length === 0) return; // Only auto-save for new profiles with data
    
    try {
      const completion = user.isRecruiter ? calculateRecruiterCompletion() : calculateCandidateCompletion();
      const { saveProfile, updateProfile } = await import('@/lib/actions/general.actions');
      
      const action = mode === 'create' ? saveProfile : updateProfile;
      await action(user.id, {
        ...formData,
        completionPercentage: completion.percentage,
        completedSections: completion.sections
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Add individual skill
  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    const currentSkills = formData.skills || [];
    if (!currentSkills.includes(skill.trim())) {
      updateField('skills', [...currentSkills, skill.trim()]);
      setCurrentSkill('');
      autoSave();
    }
  };

  // Add individual language
  const addLanguage = (language: string) => {
    if (!language.trim()) return;
    const currentLanguages = formData.languages || [];
    if (!currentLanguages.includes(language.trim())) {
      updateField('languages', [...currentLanguages, language.trim()]);
      setCurrentLanguage('');
      autoSave();
    }
  };

  // Handle Enter key press for auto-save
  const handleKeyPress = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (callback) {
        callback();
      } else {
        autoSave();
      }
    }
  };

  const calculateCandidateCompletion = () => {
    const sections = {
      basicInfo: 0,
      summary: 0,
      skills: 0,
      workExperience: 0,
      education: 0,
      projects: 0,
      achievements: 0,
      languages: 0,
      socialLinks: 0
    };

    // 1. Basic Information (Current Role, Experience, Location)
    if (formData.currentRole?.trim() && formData.experience && formData.location?.trim()) {
      sections.basicInfo = 1;
    }

    // 2. Professional Summary
    if (formData.summary?.trim() && formData.summary.trim().length >= 50) {
      sections.summary = 1;
    }

    // 3. Skills
    if (formData.skills && formData.skills.length > 0) {
      sections.skills = 1;
    }

    // 4. Work Experience
    if (formData.workExperience && formData.workExperience.length > 0) {
      const hasValidExperience = formData.workExperience.some((exp: WorkExperience) => 
        exp.company?.trim() && exp.position?.trim() && exp.startDate?.trim() && exp.description?.trim()
      );
      if (hasValidExperience) {
        sections.workExperience = 1;
      }
    }

    // 5. Education
    if (formData.education && formData.education.length > 0) {
      const hasValidEducation = formData.education.some((edu: Education) => 
        edu.institution?.trim() && edu.degree?.trim() && edu.fieldOfStudy?.trim() && edu.startDate?.trim()
      );
      if (hasValidEducation) {
        sections.education = 1;
      }
    }

    // 6. Projects
    if (formData.projects && formData.projects.length > 0) {
      const hasValidProject = formData.projects.some((project: Project) => 
        project.name?.trim() && project.description?.trim() && project.technologies && project.technologies.length > 0
      );
      if (hasValidProject) {
        sections.projects = 1;
      }
    }

    // 7. Achievements
    if (formData.achievements && formData.achievements.length > 0) {
      const hasValidAchievement = formData.achievements.some((achievement: Achievement) => 
        achievement.title?.trim() && achievement.description?.trim() && achievement.date?.trim() && achievement.organization?.trim()
      );
      if (hasValidAchievement) {
        sections.achievements = 1;
      }
    }

    // 8. Languages
    if (formData.languages && formData.languages.length > 0) {
      sections.languages = 1;
    }

    // 9. Social Links
    if (formData.socialLinks?.linkedin || formData.socialLinks?.github || formData.socialLinks?.portfolio) {
      sections.socialLinks = 1;
    }

    const completedSections = Object.values(sections).reduce((sum, val) => sum + val, 0);
    const percentage = Math.round((completedSections / 9) * 100);
    
    return { sections, completedSections, percentage };
  };

  const calculateRecruiterCompletion = () => {
    const sections = {
      companyInfo: 0,
      specialties: 0,
      socialLinks: 0
    };

    // 1. Company Information
    if (formData.companyDescription?.trim() && formData.companyDescription.trim().length >= 100 && 
        formData.sector?.trim() && formData.companySize?.trim() && formData.location?.trim()) {
      sections.companyInfo = 1;
    }

    // 2. Company Specialties
    if (formData.specialties && formData.specialties.length > 0) {
      sections.specialties = 1;
    }

    // 3. Social Links (LinkedIn required for recruiters)
    if (formData.socialLinks?.linkedin?.trim()) {
      sections.socialLinks = 1;
    }

    const completedSections = Object.values(sections).reduce((sum, val) => sum + val, 0);
    const percentage = Math.round((completedSections / 3) * 100);
    
    return { sections, completedSections, percentage };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate completion percentage
    const completion = user.isRecruiter ? calculateRecruiterCompletion() : calculateCandidateCompletion();
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (mode === 'create') {
        // Use saveProfile for creating new profile
        const { saveProfile } = await import('@/lib/actions/general.actions');
        result = await saveProfile(user.id, {
          ...formData,
          completionPercentage: completion.percentage,
          completedSections: completion.sections
        });
      } else {
        // Use updateProfile for editing existing profile
        const { updateProfile } = await import('@/lib/actions/general.actions');
        result = await updateProfile(user.id, {
          ...formData,
          completionPercentage: completion.percentage,
          completedSections: completion.sections
        });
      }

      if (result.success) {
        if (completion.percentage === 100) {
          toast.success(mode === 'create' ? 'Profile created successfully!' : 'Profile updated successfully!');
          // Always redirect to profile page after successful submission
          router.push(`/user/${user.id}/profile`);
        } else {
          toast.success(`Profile saved! Completion: ${completion.percentage}%`);
          // For incomplete profiles, stay on the same page to continue editing
        }
      } else {
        toast.error(result.message || `Failed to ${mode} profile`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} profile:`, error);
      toast.error(`An error occurred while ${mode === 'create' ? 'creating' : 'updating'} profile`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (arrayField: string, index: number, field: string, value: string | boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [arrayField]: prev[arrayField]?.map((item: Record<string, unknown>, i: number) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const addArrayItem = (arrayField: string, newItem: object) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] || []), newItem]
    }));
  };

  const removeArrayItem = (arrayField: string, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [arrayField]: prev[arrayField]?.filter((_: any, i: number) => i !== index) || []
    }));
  };

  const removeSkill = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skills: prev.skills?.filter((_: any, i: number) => i !== index) || []
    }));
  };

  const removeSpecialty = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      specialties: prev.specialties?.filter((_: any, i: number) => i !== index) || []
    }));
  };

  if (user.isRecruiter) {
    const completion = calculateRecruiterCompletion();
    
    return (
      <div className="space-y-8">
        {/* Completion Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>
              Complete all sections to unlock full profile features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{completion.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    completion.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                <span className={`flex items-center gap-1 ${completion.sections.companyInfo ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${completion.sections.companyInfo ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Company Info
                </span>
                <span className={`flex items-center gap-1 ${completion.sections.specialties ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${completion.sections.specialties ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Specialties
                </span>
                <span className={`flex items-center gap-1 ${completion.sections.socialLinks ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${completion.sections.socialLinks ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Social Links
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Tell us about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={formData.companyDescription || ''}
                onChange={(e) => updateField('companyDescription', e.target.value)}
                placeholder="Describe your company, its mission, values, and what makes it unique..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={formData.sector || ''}
                  onChange={(e) => updateField('sector', e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <select
                  id="companySize"
                  value={formData.companySize || ''}
                  onChange={(e) => updateField('companySize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  value={formData.founded || ''}
                  onChange={(e) => updateField('founded', e.target.value)}
                  placeholder="e.g., 2010"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            {/* Company Specialties */}
            <div className="space-y-2">
              <Label htmlFor="specialties">Company Specialties</Label>
              <Input
                id="specialties"
                value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : formData.specialties || ''}
                onChange={(e) => {
                  const specialtiesArray = e.target.value.split(',').map(specialty => specialty.trim()).filter(specialty => specialty);
                  updateField('specialties', specialtiesArray);
                }}
                placeholder="e.g., Software Development, Consulting, Cloud Services"
              />
              <p className="text-sm text-gray-500">Separate each specialty with a comma</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialties?.map((specialty: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your company&apos;s social presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) => updateNestedField('socialLinks', 'linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => updateNestedField('socialLinks', 'twitter', e.target.value)}
                placeholder="https://twitter.com/yourcompany"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 
              (mode === 'create' ? 'Saving...' : 'Updating...') : 
              (completion.percentage === 100 ? 
                (mode === 'create' ? 'Create Profile' : 'Update Profile') : 
                'Save Progress'
              )
            }
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(mode === 'create' ? '/' : `/user/${user.id}/profile`)}
          >
            Cancel
          </Button>
        </div>
      </form>
      </div>
    );
  }

  // Candidate profile form with all sections
  const completion = calculateCandidateCompletion();
  
  return (
    <div className="space-y-8">
      {/* Completion Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete all 9 sections to unlock full profile features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{completion.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  completion.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
              <span className={`flex items-center gap-1 ${completion.sections.basicInfo ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.basicInfo ? 'bg-green-500' : 'bg-gray-300'}`} />
                Basic Info
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.summary ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.summary ? 'bg-green-500' : 'bg-gray-300'}`} />
                Summary
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.skills ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.skills ? 'bg-green-500' : 'bg-gray-300'}`} />
                Skills
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.workExperience ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.workExperience ? 'bg-green-500' : 'bg-gray-300'}`} />
                Experience
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.education ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.education ? 'bg-green-500' : 'bg-gray-300'}`} />
                Education
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.projects ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.projects ? 'bg-green-500' : 'bg-gray-300'}`} />
                Projects
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.achievements ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.achievements ? 'bg-green-500' : 'bg-gray-300'}`} />
                Achievements
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.languages ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.languages ? 'bg-green-500' : 'bg-gray-300'}`} />
                Languages
              </span>
              <span className={`flex items-center gap-1 ${completion.sections.socialLinks ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${completion.sections.socialLinks ? 'bg-green-500' : 'bg-gray-300'}`} />
                Social Links
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your current role and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentRole">Current Role</Label>
              <Input
                id="currentRole"
                value={formData.currentRole || ''}
                onChange={(e) => updateField('currentRole', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={formData.experience || ''}
                onChange={(e) => updateField('experience', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 3"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Email cannot be changed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>Tell us about yourself and your career goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a compelling summary about your professional experience, skills, and career objectives..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add your technical and professional skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="skills">Add Skill</Label>
            <Input
              id="skills"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => addSkill(currentSkill))}
              placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
            />
            <p className="text-sm text-gray-500">Type a skill and press Enter to add it</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Add your professional work experience</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('workExperience', {
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                description: '',
                isCurrentJob: false
              })}
            >
              <Plus size={16} className="mr-1" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.workExperience?.map((exp: WorkExperience, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Experience {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem('workExperience', index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={exp.company || ''}
                    onChange={(e) => updateArrayItem('workExperience', index, 'company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={exp.position || ''}
                    onChange={(e) => updateArrayItem('workExperience', index, 'position', e.target.value)}
                    placeholder="Job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={exp.location || ''}
                    onChange={(e) => updateArrayItem('workExperience', index, 'location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={exp.startDate || ''}
                    onChange={(e) => updateArrayItem('workExperience', index, 'startDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={exp.endDate || ''}
                    onChange={(e) => updateArrayItem('workExperience', index, 'endDate', e.target.value)}
                    disabled={toBool(exp.isCurrentJob)}
                    placeholder={toBool(exp.isCurrentJob) ? 'Present' : ''}
                  />
                </div>
                
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`currentJob-${index}`}
                      checked={toBool(exp.isCurrentJob)}
                      onChange={(e) => updateArrayItem('workExperience', index, 'isCurrentJob', e.target.checked)}
                    />
                    <Label htmlFor={`currentJob-${index}`}>I currently work here</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={exp.description || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          {(!formData.workExperience || formData.workExperience.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No work experience added yet. Click &quot;Add Experience&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('education', {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                grade: ''
              })}
            >
              <Plus size={16} className="mr-1" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.education?.map((edu: Education, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem('education', index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution || ''}
                    onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                    placeholder="University/School name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => updateArrayItem('education', index, 'fieldOfStudy', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Grade/GPA (Optional)</Label>
                  <Input
                    value={edu.grade || ''}
                    onChange={(e) => updateArrayItem('education', index, 'grade', e.target.value)}
                    placeholder="e.g., 3.8/4.0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={edu.startDate || ''}
                    onChange={(e) => updateArrayItem('education', index, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={edu.endDate || ''}
                    onChange={(e) => updateArrayItem('education', index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!formData.education || formData.education.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No education added yet. Click &quot;Add Education&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Showcase your personal and professional projects</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('projects', {
                name: '',
                description: '',
                technologies: [],
                liveUrl: '',
                githubUrl: ''
              })}
            >
              <Plus size={16} className="mr-1" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.projects?.map((project: Project, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Project {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem('projects', index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={project.name || ''}
                    onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                    placeholder="Project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={project.description || ''}
                    onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                    placeholder="Describe what the project does and your role..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Live URL (Optional)</Label>
                    <Input
                      value={project.liveUrl || ''}
                      onChange={(e) => updateArrayItem('projects', index, 'liveUrl', e.target.value)}
                      placeholder="https://yourproject.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>GitHub URL (Optional)</Label>
                    <Input
                      value={project.githubUrl || ''}
                      onChange={(e) => updateArrayItem('projects', index, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <Input
                    placeholder="Add technologies (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          const techs = input.value.split(',').map(t => t.trim()).filter(t => t);
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          setFormData((prev: any) => ({
                            ...prev,                            projects: prev.projects?.map((proj: Project, i: number) =>
                              i === index ? { ...proj, technologies: techs } : proj
                            ) || []
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies?.map((tech: string, techIndex: number) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!formData.projects || formData.projects.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No projects added yet. Click &quot;Add Project&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect your professional online presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.socialLinks?.linkedin || ''}
              onChange={(e) => updateNestedField('socialLinks', 'linkedin', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={formData.socialLinks?.github || ''}
              onChange={(e) => updateNestedField('socialLinks', 'github', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio</Label>
            <Input
              id="portfolio"
              value={formData.socialLinks?.portfolio || ''}
              onChange={(e) => updateNestedField('socialLinks', 'portfolio', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={formData.socialLinks?.twitter || ''}
              onChange={(e) => updateNestedField('socialLinks', 'twitter', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://twitter.com/yourusername"
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Add your professional achievements, awards, and recognitions</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('achievements', {
                title: '',
                description: '',
                date: '',
                organization: '',
                url: ''
              })}
            >
              <Plus size={16} className="mr-1" />
              Add Achievement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.achievements?.map((achievement: Achievement, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Achievement {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem('achievements', index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Achievement Title</Label>
                  <Input
                    value={achievement.title || ''}
                    onChange={(e) => updateArrayItem('achievements', index, 'title', e.target.value)}
                    placeholder="e.g., Employee of the Year"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={achievement.organization || ''}
                    onChange={(e) => updateArrayItem('achievements', index, 'organization', e.target.value)}
                    placeholder="e.g., Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="month"
                    value={achievement.date || ''}
                    onChange={(e) => updateArrayItem('achievements', index, 'date', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reference URL (Optional)</Label>
                  <Input
                    value={achievement.url || ''}
                    onChange={(e) => updateArrayItem('achievements', index, 'url', e.target.value)}
                    placeholder="Link to achievement details"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={achievement.description || ''}
                  onChange={(e) => updateArrayItem('achievements', index, 'description', e.target.value)}
                  placeholder="Describe the achievement and its impact..."
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          {(!formData.achievements || formData.achievements.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No achievements added yet. Click &quot;Add Achievement&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>Add languages you speak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="languages">Add Language</Label>
            <Input
              id="languages"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => addLanguage(currentLanguage))}
              placeholder="e.g., English, Spanish, French, Mandarin"
            />
            <p className="text-sm text-gray-500">Type a language and press Enter to add it</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages?.map((language: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setFormData((prev: any) => ({
                        ...prev,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        languages: prev.languages?.filter((_: any, i: number) => i !== index) || []
                      }));
                      autoSave();
                    }}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 
            (mode === 'create' ? 'Saving...' : 'Updating...') : 
            (completion.percentage === 100 ? 
              (mode === 'create' ? 'Create Profile' : 'Update Profile') : 
              'Save Progress'
            )
          }
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push(mode === 'create' ? '/' : `/user/${user.id}/profile`)}
        >
          Cancel
        </Button>
      </div>
    </form>
    </div>
  );
}
