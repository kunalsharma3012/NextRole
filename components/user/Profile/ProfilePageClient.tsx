'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getInterviewByUserId, getUserTakenInterviews } from '@/lib/actions/general.actions';

interface ProfilePageClientProps {
  currentUser: User;
  profileUser: User;
  profile: {
    id?: string;
    summary?: string;
    skills?: string[];
    workExperience?: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate?: string;
      description: string;
      isCurrentJob: boolean;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate?: string;
      grade?: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
      liveUrl?: string;
      githubUrl?: string;
    }>;
    achievements?: Array<{
      title: string;
      description: string;
      date: string;
      organization: string;
      url?: string;
    }>;
    currentRole?: string;
    experience?: string;
    location?: string;
    // Recruiter fields
    companyDescription?: string;
    sector?: string;
    companySize?: string;
    founded?: string;
    website?: string;
    specialties?: string[];
    completionPercentage?: number;
    [key: string]: unknown;
  } | null;
  isOwnProfile: boolean;
}

const ProfilePageClient = ({ profileUser, profile, isOwnProfile }: ProfilePageClientProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<{
    createdInterviews: number;
    takenInterviews: number;
  } | null>(null);

  // Load interview stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [created, taken] = await Promise.all([
          getInterviewByUserId(profileUser.id),
          isOwnProfile ? getUserTakenInterviews(profileUser.id) : []
        ]);
        
        setStats({
          createdInterviews: created?.length || 0,
          takenInterviews: taken?.length || 0
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        setStats({ createdInterviews: 0, takenInterviews: 0 });
      }
    };

    loadStats();
  }, [profileUser.id, isOwnProfile]);

  // Get user's initial for avatar
  const userInitial = profileUser.name ? profileUser.name.charAt(0).toUpperCase() : '?';
  const avatarColor = profileUser.avatarColor || 'bg-blue-500';

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ];

  // Filter tabs based on available data
  const availableTabs = tabs.filter(tab => {
    switch (tab.id) {
      case 'overview': return true;
      case 'experience': return profile?.workExperience && profile.workExperience.length > 0;
      case 'education': return profile?.education && profile.education.length > 0;
      case 'projects': return profile?.projects && profile.projects.length > 0;
      case 'achievements': return profile?.achievements && profile.achievements.length > 0;
      default: return false;
    }
  });

  const renderTabContent = () => {
    if (!profile) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-primary-100 mb-2">No Profile Information</h3>
          <p className="text-light-400 mb-6">
            {isOwnProfile ? 'Complete your profile to showcase your skills and experience.' : 'This user has not completed their profile yet.'}
          </p>
          {isOwnProfile && (
            <Link href={`/user/${profileUser.id}/profile/edit`}>
              <Button>Complete Profile</Button>
            </Link>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Professional Summary */}
            {profile.summary && (
              <div className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <h3 className="text-lg font-semibold text-primary-100 mb-3">
                  {profileUser.isRecruiter ? 'Company Overview' : 'Professional Summary'}
                </h3>
                <p className="text-light-400 leading-relaxed">{profile.summary}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <h3 className="text-lg font-semibold text-primary-100 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <span key={index} className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter specific fields */}
            {profileUser.isRecruiter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Details */}
                <div className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">Company Details</h3>
                  <div className="space-y-3">
                    {profile.sector && (
                      <div>
                        <span className="text-primary-300 text-sm">Sector:</span>
                        <p className="text-light-400">{profile.sector}</p>
                      </div>
                    )}
                    {profile.companySize && (
                      <div>
                        <span className="text-primary-300 text-sm">Company Size:</span>
                        <p className="text-light-400">{profile.companySize}</p>
                      </div>
                    )}
                    {profile.location && (
                      <div>
                        <span className="text-primary-300 text-sm">Location:</span>
                        <p className="text-light-400">{profile.location}</p>
                      </div>
                    )}
                    {profile.founded && (
                      <div>
                        <span className="text-primary-300 text-sm">Founded:</span>
                        <p className="text-light-400">{profile.founded}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                    <h3 className="text-lg font-semibold text-primary-100 mb-4">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty: string, index: number) => (
                        <span key={index} className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {profile.workExperience?.map((exp, index) => (
              <div key={index} className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100">{exp.position}</h3>
                    <p className="text-primary-300 font-medium">{exp.company}</p>
                    {exp.location && <p className="text-light-400 text-sm">{exp.location}</p>}
                  </div>
                  <span className="text-sm text-light-400 bg-dark-300 px-3 py-1 rounded-full">
                    {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-light-400 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            {profile.education?.map((edu, index) => (
              <div key={index} className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100">{edu.degree}</h3>
                    <p className="text-primary-300 font-medium">{edu.institution}</p>
                    <p className="text-light-400">{edu.fieldOfStudy}</p>
                  </div>
                  <span className="text-sm text-light-400 bg-dark-300 px-3 py-1 rounded-full">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                {edu.grade && (
                  <p className="text-light-400">Grade: {edu.grade}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            {profile.projects?.map((project, index) => (
              <div key={index} className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-primary-100">{project.name}</h3>
                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 bg-blue-500/20 rounded-full transition-colors">
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-gray-400 hover:text-gray-300 text-sm px-3 py-1 bg-gray-500/20 rounded-full transition-colors">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-light-400 leading-relaxed mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span key={techIndex} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-4">
            {profile.achievements?.map((achievement, index) => (
              <div key={index} className="bg-dark-gradient-2 rounded-lg p-6 border border-primary-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100">{achievement.title}</h3>
                    <p className="text-primary-300 font-medium">{achievement.organization}</p>
                  </div>
                  <span className="text-sm text-light-400 bg-dark-300 px-3 py-1 rounded-full">
                    {achievement.date}
                  </span>
                </div>
                <p className="text-light-400 leading-relaxed">{achievement.description}</p>
                {achievement.url && (
                  <a href={achievement.url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                    View Certificate →
                  </a>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-100">
              {isOwnProfile ? 'My Profile' : `${profileUser.name}'s Profile`}
            </h1>
            <p className="text-light-400 mt-2">
              {isOwnProfile 
                ? 'Manage your professional profile and career information'
                : `${profileUser.isRecruiter ? 'Company' : 'Professional'} profile overview`
              }
            </p>
          </div>
          
          {isOwnProfile && (
            <Link href={`/user/${profileUser.id}/profile/edit`}>
              <Button>
                Edit Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-dark-gradient-2 rounded-2xl p-8 border border-primary-500/20 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className={`w-28 h-28 rounded-full ${avatarColor} flex items-center justify-center text-white text-4xl font-semibold shadow-lg border-4 border-primary-500/30`}>
              {userInitial}
            </div>
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-bold text-primary-100">{profileUser.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profileUser.isRecruiter
                    ? 'bg-green-500/20 text-green-200'
                    : 'bg-blue-500/20 text-blue-200'
                }`}>
                  {profileUser.isRecruiter ? 'Recruiter' : 'Candidate'}
                </span>
              </div>
              
              {isOwnProfile && (
                <p className="text-light-400 mb-4">{profileUser.email}</p>
              )}

              {/* Profile completion */}
              {profile?.completionPercentage && (
                <div className="mb-4 w-full max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-light-400">Profile Completion</span>
                    <span className="text-sm font-medium text-primary-100">{profile.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        profile.completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${profile.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                  <div className="text-primary-300 text-sm mb-1">Created Interviews</div>
                  <div className="text-2xl font-bold text-primary-100">{stats?.createdInterviews || 0}</div>
                </div>

                {isOwnProfile && (
                  <div className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                    <div className="text-primary-300 text-sm mb-1">Taken Interviews</div>
                    <div className="text-2xl font-bold text-primary-100">{stats?.takenInterviews || 0}</div>
                  </div>
                )}

                {profile?.skills && (
                  <div className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                    <div className="text-primary-300 text-sm mb-1">Skills</div>
                    <div className="text-2xl font-bold text-primary-100">{profile.skills.length}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-dark-gradient-2 rounded-lg p-2 mb-8 border border-primary-500/20">
          <div className="flex flex-wrap gap-2">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-light-400 hover:text-primary-100 hover:bg-dark-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-dark-gradient-2 rounded-2xl p-8 border border-primary-500/20">
          {renderTabContent()}
        </div>

        {/* Quick Actions for Own Profile */}
        {isOwnProfile && (
          <div className="mt-8 bg-dark-gradient-2 rounded-2xl p-8 border border-primary-500/20">
            <h3 className="text-xl font-bold text-primary-100 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/user/${profileUser.id}/interviews`}>
                <div className="p-6 bg-dark-300 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <span className="text-green-400 text-xl">📋</span>
                    </div>
                    <h4 className="font-semibold text-primary-100">View Interviews</h4>
                  </div>
                  <p className="text-light-400 text-sm">Check your interview history and performance</p>
                </div>
              </Link>

              <Link href="/create-interview">
                <div className="p-6 bg-dark-300 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <span className="text-purple-400 text-xl">✨</span>
                    </div>
                    <h4 className="font-semibold text-primary-100">Create Interview</h4>
                  </div>
                  <p className="text-light-400 text-sm">Generate a new interview structure</p>
                </div>
              </Link>

              <Link href="/discover">
                <div className="p-6 bg-dark-300 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <span className="text-blue-400 text-xl">🔍</span>
                    </div>
                    <h4 className="font-semibold text-primary-100">Discover Interviews</h4>
                  </div>
                  <p className="text-light-400 text-sm">Find and take interviews created by others</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePageClient;