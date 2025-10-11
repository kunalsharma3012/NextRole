import { getInterviewByUserId, getUserTakenInterviews } from '@/lib/actions/general.actions';
import React from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenIcon, FileTextIcon } from 'lucide-react';

interface ProfileInfoCardProps {
    currentUser: User;
    profileUser: User;
    profile?: {
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
        certifications?: Array<{
            name: string;
            issuer: string;
            issueDate: string;
            expiryDate?: string;
            credentialId?: string;
            credentialUrl?: string;
        }>;
        achievements?: Array<{
            title: string;
            description: string;
            date: string;
            organization: string;
            url?: string;
        }>;
        languages?: string[];
        socialLinks?: {
            linkedin?: string;
            github?: string;
            portfolio?: string;
            twitter?: string;
        };
        // Basic contact information
        currentRole?: string;
        experience?: string;
        // Shared fields
        location?: string;
        // Recruiter specific fields
        companyDescription?: string;
        sector?: string;
        companySize?: string;
        founded?: string;
        website?: string;
        specialties?: string[];
        completionPercentage?: number; // Profile completion percentage from DB
        [key: string]: unknown;
    };
}

const ProfileInfoCard = async ({ currentUser, profileUser, profile }: ProfileInfoCardProps) => {
    // Check if viewing own profile
    const isOwnProfile = currentUser.id === profileUser.id;

    // Get taken interviews (only for own profile)
    const takenInterviews = isOwnProfile ? await getUserTakenInterviews(profileUser.id) : [];

    // Get created interviews
    const createdInterviews = await getInterviewByUserId(profileUser.id);
    
    // For recruiters, separate mock and job interviews (assuming interviews have a type field)
    const mockInterviews = createdInterviews?.filter(interview => interview.type === 'mock') || [];
    const jobInterviews = createdInterviews?.filter(interview => interview.type === 'job') || [];

    // Get user's initial for avatar
    const userInitial = profileUser.name ? profileUser.name.charAt(0).toUpperCase() : '?';
    const avatarColor = profileUser.avatarColor || 'bg-blue-500'; // Default to blue if no color is set

    // Get profile completion percentage from database or default to 0
    const completionPercentage = profile?.completionPercentage || 0;
    const circumference = 2 * Math.PI * 45; // radius of 45
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    return (
        <div className="space-y-6">
            {/* Enhanced Profile Info Card */}
            <div className="relative overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
                <div className="relative bg-dark-900/90 backdrop-blur-xl rounded-3xl p-8 border border-primary-500/20 shadow-2xl">
                    {/* Action buttons - positioned at top right */}
                    {isOwnProfile && (
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3 z-10">
                            {profile && (
                                <Link href={`/user/${profileUser.id}/profile/edit`}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="group relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
                                        <div className="relative flex items-center gap-2">
                                            <PenIcon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                            <span className="hidden sm:inline text-blue-100 group-hover:text-white font-medium">Edit Profile</span>
                                        </div>
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/user/${profileUser.id}/interviews`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="group relative overflow-hidden bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 hover:border-green-400/50 backdrop-blur-sm shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-teal-500/0 group-hover:from-green-500/20 group-hover:to-teal-500/20 transition-all duration-300"></div>
                                    <div className="relative flex items-center gap-2">
                                        <FileTextIcon className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                                        <span className="hidden sm:inline text-green-100 group-hover:text-white font-medium">View Interviews</span>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative flex-shrink-0">
                            {/* Progress Ring */}
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-gray-600"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-300 ${completionPercentage >= 80 ? 'text-green-500' :
                                        completionPercentage >= 60 ? 'text-yellow-500' :
                                            completionPercentage >= 30 ? 'text-orange-500' : 'text-red-500'
                                        }`}
                                />
                            </svg>
                            {/* Avatar */}
                            <div className={`absolute inset-2 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-semibold shadow-lg`}>
                                {userInitial}
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-start flex-1">
                            <h1 className="text-3xl font-bold text-primary-100 mb-2">{profileUser.name}</h1>
                            {isOwnProfile && <p className="text-light-400 mb-4">{profileUser.email}</p>}

                            {/* Role Badge */}
                            <div className="mb-4">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg ${profileUser.isRecruiter
                                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 border border-green-500/30'
                                    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30'
                                    }`}>
                                    {profileUser.isRecruiter ? '🏢 Recruiter' : '👤 Candidate'}
                                </span>
                            </div>

                            {/* Enhanced Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                {profileUser.isRecruiter ? (
                                    <>
                                        {/* Created Mock Interviews Card */}
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent rounded-2xl p-6 border border-blue-500/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-blue-500/10 hover:shadow-xl">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-blue-300 text-sm font-medium">Mock</div>
                                                        <div className="text-xs text-blue-300/60">Interview structures</div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-bold text-blue-100 mb-1">{mockInterviews.length}</div>
                                            </div>
                                        </div>

                                        {/* Created Job Interviews Card */}
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent rounded-2xl p-6 border border-purple-500/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-purple-500/10 hover:shadow-xl">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
                                                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6a2 2 0 002 2h4a2 2 0 002-2" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-purple-300 text-sm font-medium">Job</div>
                                                        <div className="text-xs text-purple-300/60">Interview structures</div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-bold text-purple-100 mb-1">{jobInterviews.length}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Created Mock Interviews Card for Candidates */}
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent rounded-2xl p-6 border border-blue-500/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-blue-500/10 hover:shadow-xl">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-blue-300 text-sm font-medium">Created</div>
                                                        <div className="text-xs text-blue-300/60">Mock interview structure</div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-bold text-blue-100 mb-1">{createdInterviews ? createdInterviews.length : 0}</div>
                                            </div>
                                        </div>

                                        {/* Taken Interviews Card - Only for candidates viewing own profile */}
                                        {isOwnProfile && (
                                            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-600/5 to-transparent rounded-2xl p-6 border border-green-500/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-green-500/10 hover:shadow-xl">
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/30">
                                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-green-300 text-sm font-medium">Taken</div>
                                                            <div className="text-xs text-green-300/60">Practice sessions</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-100 mb-1">{takenInterviews.length}</div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            {profile && (
                <div className="card-border w-full">
                    <div className="dark-gradient rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-primary-100 mb-6">Profile Details</h2>

                        {profileUser.isRecruiter ? (
                            <div className="space-y-6">
                                {/* Company Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-primary-100 mb-2">Company Description</h3>
                                    <p className="text-light-400">{profile.companyDescription}</p>
                                </div>

                                {/* Company Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-primary-300 mb-1">Sector</h4>
                                        <p className="text-light-400">{profile.sector}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-primary-300 mb-1">Company Size</h4>
                                        <p className="text-light-400">{profile.companySize}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-primary-300 mb-1">Location</h4>
                                        <p className="text-light-400">{profile.location}</p>
                                    </div>
                                    {profile.founded && (
                                        <div>
                                            <h4 className="text-sm font-medium text-primary-300 mb-1">Founded</h4>
                                            <p className="text-light-400">{profile.founded}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Specialties */}
                                {profile.specialties && profile.specialties.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-primary-300 mb-2">Specialties</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.specialties.map((specialty: string, index: number) => (
                                                <span key={index} className="bg-primary-500/20 text-primary-200 px-3 py-1 rounded-full text-sm">
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                {(profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.website) && (
                                    <div>
                                        <h4 className="text-sm font-medium text-primary-300 mb-2">Links</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {profile.website && (
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    Website
                                                </a>
                                            )}
                                            {profile.socialLinks?.linkedin && (
                                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    LinkedIn
                                                </a>
                                            )}
                                            {profile.socialLinks?.twitter && (
                                                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    Twitter
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Information */}
                                {(profile.currentRole || profile.experience || profile.location) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-4">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {profile.currentRole && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-primary-300 mb-1">Current Role</h4>
                                                    <p className="text-light-400">{profile.currentRole}</p>
                                                </div>
                                            )}
                                            {profile.experience && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-primary-300 mb-1">Experience</h4>
                                                    <p className="text-light-400">{profile.experience} {parseInt(profile.experience) === 1 ? 'year' : 'years'}</p>
                                                </div>
                                            )}
                                            {profile.location && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-primary-300 mb-1">Location</h4>
                                                    <p className="text-light-400">{profile.location}</p>
                                                </div>
                                            )}
                                            {/* Email is always shown from user object */}
                                            <div>
                                                <h4 className="text-sm font-medium text-primary-300 mb-1">Email</h4>
                                                <p className="text-light-400">{profileUser.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div>
                                    <h3 className="text-lg font-semibold text-primary-100 mb-2">Professional Summary</h3>
                                    <p className="text-light-400">{profile.summary}</p>
                                </div>

                                {/* Skills */}
                                {profile.skills && profile.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill: string, index: number) => (
                                                <span key={index} className="bg-primary-500/20 text-primary-200 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Work Experience */}
                                {profile.workExperience && profile.workExperience.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-4">Work Experience</h3>
                                        <div className="space-y-4">
                                            {profile.workExperience.map((exp, index) => (
                                                <div key={index} className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                                                    <div className="flex justify-between items-start mb-2">                                        <div>
                                                        <h4 className="font-semibold text-primary-100">{exp.position}</h4>
                                                        <p className="text-primary-300">{exp.company}</p>
                                                        {exp.location && <p className="text-light-400 text-sm">{exp.location}</p>}
                                                    </div>
                                                        <span className="text-sm text-light-400">
                                                            {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-light-400 text-sm">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {profile.education && profile.education.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-4">Education</h3>
                                        <div className="space-y-4">
                                            {profile.education.map((edu, index) => (
                                                <div key={index} className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-primary-100">{edu.degree}</h4>
                                                            <p className="text-primary-300">{edu.institution}</p>
                                                            <p className="text-light-400 text-sm">{edu.fieldOfStudy}</p>
                                                        </div>
                                                        <span className="text-sm text-light-400">
                                                            {edu.startDate} - {edu.endDate}
                                                        </span>
                                                    </div>
                                                    {edu.grade && (
                                                        <p className="text-light-400 text-sm">Grade: {edu.grade}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {profile.projects && profile.projects.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-4">Projects</h3>
                                        <div className="space-y-4">
                                            {profile.projects.map((project, index) => (
                                                <div key={index} className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold text-primary-100">{project.name}</h4>
                                                        <div className="flex gap-2">
                                                            {project.liveUrl && (
                                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                                                                    Live
                                                                </a>
                                                            )}
                                                            {project.githubUrl && (
                                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                                                                    GitHub
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-light-400 text-sm mb-2">{project.description}</p>
                                                    {project.technologies && project.technologies.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.technologies.map((tech: string, techIndex: number) => (
                                                                <span key={techIndex} className="bg-primary-500/20 text-primary-200 px-2 py-1 rounded text-xs">
                                                                    {tech}
                                                                </span>))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}                                {/* Achievements */}
                                {profile.achievements && profile.achievements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-4">Achievements</h3>
                                        <div className="space-y-4">
                                            {profile.achievements.map((achievement, index) => (
                                                <div key={index} className="bg-dark-gradient-2 rounded-lg p-4 border border-primary-500/20">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-primary-100">{achievement.title}</h4>
                                                            <p className="text-primary-300">{achievement.organization}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm text-light-400">{achievement.date}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-light-400 text-sm mb-2">{achievement.description}</p>
                                                    {achievement.url && (
                                                        <a href={achievement.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                                                            View Details
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Languages */}
                                {profile.languages && profile.languages.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-2">Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.languages.map((language: string, index: number) => (
                                                <span key={index} className="bg-primary-500/20 text-primary-200 px-3 py-1 rounded-full text-sm">
                                                    {language}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                {(profile.socialLinks?.linkedin || profile.socialLinks?.github || profile.socialLinks?.portfolio || profile.socialLinks?.twitter) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-100 mb-2">Social Links</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {profile.socialLinks?.linkedin && (
                                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    LinkedIn
                                                </a>
                                            )}
                                            {profile.socialLinks?.github && (
                                                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    GitHub
                                                </a>
                                            )}
                                            {profile.socialLinks?.portfolio && (
                                                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    Portfolio
                                                </a>
                                            )}
                                            {profile.socialLinks?.twitter && (
                                                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                    Twitter
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileInfoCard