import InterviewStructuresSection from '@/components/user/InterviewStructuresSection';
import EmptyState from '@/components/shared/EmptyState';
import { getCurrentUser, getUserById } from '@/lib/actions/auth.action';
import { getUserInterviewStructures } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import React from 'react';

const UserInterviewsPage = async ({ params }: RouteParams) => {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    // Redirect if not authenticated
    if (!currentUser) {
        redirect('/sign-in');
    }

    // Get profile user (could be current user or another user)
    const profileUser = await getUserById(id);

    if (!profileUser) {
        redirect('/');
    }

    // Check if viewing own profile
    const isOwnProfile = currentUser.id === profileUser.id;

    // Get interview structures based on user type
    const {
        takenStructures,
        createdMockStructures,
        createdJobStructures
    } = await getUserInterviewStructures(profileUser.id, profileUser.isRecruiter, isOwnProfile);

    // Check if user has any interviews at all - for recruiters, exclude taken interviews
    const hasAnyInterviews = profileUser.isRecruiter ? (
        (createdMockStructures && createdMockStructures.length > 0) ||
        (createdJobStructures && createdJobStructures.length > 0)
    ) : (
        (takenStructures && takenStructures.length > 0) ||
        (createdMockStructures && createdMockStructures.length > 0) ||
        (createdJobStructures && createdJobStructures.length > 0)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-100 mb-2">
                    {isOwnProfile ? 'My Interviews' : `${profileUser.name}'s Interviews`}
                </h1>
                <p className="text-light-400">
                    {isOwnProfile
                        ? 'Manage your interviews and view your interview history'
                        : `View ${profileUser.name}'s public interviews`
                    }
                </p>
            </div>

            {/* Overall Empty State - when user has no interviews at all */}
            {!hasAnyInterviews && isOwnProfile && (
                <EmptyState
                    icon="/user.png"
                    containerSize="lg"
                    title={profileUser.isRecruiter ? "Welcome to Your Interview Hub!" : "Welcome to Your Interview Hub!"}
                    description={profileUser.isRecruiter
                        ? "This is where you'll manage all your interview creations. Start by creating mock interviews to help candidates practice, or set up job interviews to streamline your hiring process."
                        : "This is where you'll find all your interview activities. Start by taking mock interviews to practice your skills, or create your own interviews to help others prepare for their career journey."
                    }
                    primaryAction={{
                        text: profileUser.isRecruiter ? "Create Interview" : "Discover Interviews",
                        href: profileUser.isRecruiter ? "/create-interview" : "/discover",
                        icon: profileUser.isRecruiter ? "/star.svg" : "/tech.svg"
                    }}
                    secondaryAction={profileUser.isRecruiter ? {
                        text: "Explore Platform",
                        href: "/discover",
                        icon: "/tech.svg"
                    } : {
                        text: "Create Interview",
                        href: "/create-interview",
                        icon: "/star.svg"
                    }}
                    className="py-24"
                />
            )}

            {/* Overall Empty State for viewing other profiles */}
            {!hasAnyInterviews && !isOwnProfile && (
                <EmptyState
                    icon="/user.png"
                    containerSize="md"
                    title="No Public Interviews Available"
                    description={`${profileUser.name} hasn't shared any public interviews yet.`}
                    primaryAction={{
                        text: "Explore Other Interviews",
                        href: "/discover"
                    }}
                    className="py-24"
                />
            )}

            {/* Individual Sections - only show when user has some interviews */}
            {hasAnyInterviews && (
                <>
                    {/* Taken Interview Structures - Only for candidates (non-recruiters) viewing own profile */}
                    {isOwnProfile && !profileUser.isRecruiter && (
                        <InterviewStructuresSection
                            title="Interviews Taken"
                            structures={takenStructures || []}
                            emptyMessage="No interviews taken yet"
                            emptyStateDescription="Start your interview journey by discovering and taking mock interviews to practice your skills."
                            emptyStateIcon="/user.png"
                            emptyActionText="Discover Interviews"
                            emptyActionHref="/discover"
                        />
                    )}

                    {/* Created Mock Interview Structures */}
                    <InterviewStructuresSection
                        title="Mock Interviews Created"
                        structures={createdMockStructures || []}
                        emptyMessage={
                            isOwnProfile
                                ? "No mock interviews created yet"
                                : "No public mock interviews available"
                        }
                        emptyStateDescription={
                            isOwnProfile
                                ? "Create your first mock interview to help candidates practice and improve their skills."
                                : `${profileUser.name} hasn't created any public mock interviews yet.`
                        }
                        emptyStateIcon="/user.png"
                        emptyActionText={isOwnProfile ? "Create Mock Interview" : undefined}
                        emptyActionHref={isOwnProfile ? "/create-interview" : undefined}
                        showViewButton={!isOwnProfile && createdMockStructures !== null && createdMockStructures.length > 6}
                        viewButtonText="View All Mock"
                        viewButtonHref="/discover?category=mock"
                    />

                    {/* Created Job Interview Structures - Only for recruiters */}
                    {(profileUser.isRecruiter || (!isOwnProfile && createdJobStructures !== null && createdJobStructures.length > 0)) && (
                        <InterviewStructuresSection
                            title="Job Interviews Created"
                            structures={createdJobStructures || []}
                            emptyMessage={
                                isOwnProfile
                                    ? "No job interviews created yet"
                                    : "No public job interviews available"
                            }
                            emptyStateDescription={
                                isOwnProfile
                                    ? "Create job interviews to streamline your hiring process and find the best candidates."
                                    : `${profileUser.name} hasn't created any public job interviews yet.`
                            }
                            emptyStateIcon="/user.png"
                            emptyActionText={isOwnProfile ? "Create Job Interview" : undefined}
                            emptyActionHref={isOwnProfile ? "/create-interview" : undefined}
                            showViewButton={!isOwnProfile && createdJobStructures !== null && createdJobStructures.length > 6}
                            viewButtonText="View All Jobs"
                            viewButtonHref="/discover?category=job"
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default UserInterviewsPage