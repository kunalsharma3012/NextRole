'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileSummaryConfirmationProps {
  user: User;
  userProfile: UserProfile | null;
  structureId: string;
}

const ProfileSummaryConfirmation = ({ user, userProfile, structureId }: ProfileSummaryConfirmationProps) => {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProceed = async () => {
    if (!isConfirmed) {
      toast.error('Please confirm your profile details to proceed');
      return;
    }

    setIsGenerating(true);

    try {
      // Redirect to generation page with loading screen
      router.push(`/interview/generate?structureId=${structureId}&confirmed=true`);
    } catch (error) {
      console.error('Error proceeding:', error);
      toast.error('An error occurred while proceeding');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-dark-300 via-dark-200/90 to-dark-300 rounded-2xl border border-dark-100 p-8">
        <h2 className="text-2xl font-bold text-primary-100 mb-6 flex items-center gap-3">
          <Image src="/profile.svg" alt="profile" width={32} height={32} />
          Your Profile Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-200 border-b border-dark-100 pb-2">
              Basic Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-primary-400 text-sm">Full Name</label>
                <p className="text-primary-100 font-medium">{user.name}</p>
              </div>
              
              <div>
                <label className="text-primary-400 text-sm">Email</label>
                <p className="text-primary-100 font-medium">{user.email}</p>
              </div>

              {userProfile?.phone && (
                <div>
                  <label className="text-primary-400 text-sm">Phone</label>
                  <p className="text-primary-100 font-medium">{userProfile.phone}</p>
                </div>
              )}

              {userProfile?.location && (
                <div>
                  <label className="text-primary-400 text-sm">Location</label>
                  <p className="text-primary-100 font-medium">{userProfile.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-200 border-b border-dark-100 pb-2">
              Professional Information
            </h3>
            
            <div className="space-y-3">
              {userProfile?.currentRole && (
                <div>
                  <label className="text-primary-400 text-sm">Current Role</label>
                  <p className="text-primary-100 font-medium">{userProfile.currentRole}</p>
                </div>
              )}

              {userProfile?.experience && (
                <div>
                  <label className="text-primary-400 text-sm">Experience</label>
                  <p className="text-primary-100 font-medium">{userProfile.experience}</p>
                </div>
              )}

              {userProfile?.skills && (
                <div>
                  <label className="text-primary-400 text-sm">Skills</label>
                  <p className="text-primary-100 font-medium">{userProfile.skills}</p>
                </div>
              )}

              {userProfile?.education && (
                <div>
                  <label className="text-primary-400 text-sm">Education</label>
                  <div className="text-primary-100 font-medium">
                    {typeof userProfile.education === 'string' ? (
                      <p>{userProfile.education}</p>
                    ) : Array.isArray(userProfile.education) ? (
                      userProfile.education.map((edu: Education, index: number) => (
                        <div key={index} className="mb-2">
                          <p className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                          <p className="text-sm text-primary-300">{edu.institution}</p>
                          <p className="text-xs text-primary-400">
                            {edu.startDate} - {edu.endDate} {edu.grade && `• Grade: ${edu.grade}`}
                          </p>
                        </div>
                      ))
                    ) : userProfile.education && typeof userProfile.education === 'object' ? (
                      <div>
                        <p className="font-semibold">{(userProfile.education as Education).degree} in {(userProfile.education as Education).fieldOfStudy}</p>
                        <p className="text-sm text-primary-300">{(userProfile.education as Education).institution}</p>
                        <p className="text-xs text-primary-400">
                          {(userProfile.education as Education).startDate} - {(userProfile.education as Education).endDate} {(userProfile.education as Education).grade && `• Grade: ${(userProfile.education as Education).grade}`}
                        </p>
                      </div>
                    ) : (
                      <p>{String(userProfile.education)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume/Background */}
        {userProfile?.resume && (
          <div className="mt-6 pt-6 border-t border-dark-100">
            <h3 className="text-lg font-semibold text-primary-200 mb-3">
              Resume/Background
            </h3>
            <div className="bg-dark-100/30 rounded-lg p-4 max-h-40 overflow-y-auto">
              <p className="text-primary-300 text-sm leading-relaxed whitespace-pre-wrap">
                {userProfile.resume}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Section */}
      <div className="bg-dark-100/30 rounded-xl border border-dark-100 p-6">
        <h3 className="text-xl font-semibold text-primary-100 mb-4">
          Confirm and Proceed
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              id="profile-confirmation"
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-200 focus:ring-primary-200 border-gray-300 rounded"
            />
            <div className="space-y-2">
              <label
                htmlFor="profile-confirmation"
                className="text-primary-200 font-medium cursor-pointer"
              >
                I confirm that the above information is accurate and up-to-date
              </label>
              <p className="text-primary-400 text-sm">
                This information will be used to generate personalized interview questions based on your background, 
                skills, and experience. Please ensure all details are correct before proceeding.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-100">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="text-primary-100 border-primary-200 hover:bg-primary-200/10"
              >
                Go Back
              </Button>
              
              <Button
                onClick={handleProceed}
                disabled={!isConfirmed || isGenerating}
                className="px-8 py-3 text-dark-300 font-bold transition-all hover:shadow-lg hover:shadow-primary-200/30"
                style={{
                  background: 'linear-gradient(90deg, #cac5fe 0%, #8a82d8 50%, #dddfff 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'gradientShift 3s ease infinite',
                }}
              >
                {isGenerating ? 'Redirecting...' : 'Proceed to Interview'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            ℹ️
          </div>
          <div>
            <h4 className="text-blue-800 font-medium mb-1">How Personalization Works</h4>
            <p className="text-blue-700 text-sm">
              Our AI will analyze your profile information to generate interview questions that are specifically 
              tailored to your background, experience level, and skills. This creates a more realistic and 
              relevant interview experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummaryConfirmation;
