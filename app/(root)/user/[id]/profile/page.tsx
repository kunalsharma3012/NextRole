import React from 'react';
import { getCurrentUser, getUserById } from '@/lib/actions/auth.action';
import { getProfileByUserId } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import ProfileInfoCard from '@/components/user/Profile/ProfileInfoCard';

const UserProfilePage = async ({ params }: RouteParams) => {
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

  // Get profile data
  const profile = await getProfileByUserId(id);

  return (
    <div className="min-h-screen pattern">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ProfileInfoCard
          currentUser={currentUser}
          profileUser={profileUser}
          profile={profile || undefined}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;