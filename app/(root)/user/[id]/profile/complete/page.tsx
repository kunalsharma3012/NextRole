import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getProfileByUserId } from '@/lib/actions/general.actions';
import EditProfileForm from '@/components/user/EditProfileForm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const CompleteProfilePage = async ({ params }: RouteParams) => {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    // Redirect if not authenticated
    if (!currentUser) {
        redirect('/sign-in');
    }

    // Only allow users to complete their own profile
    if (currentUser.id !== id) {
        redirect('/');
    }

    // Check if profile is already completed
    const existingProfile = await getProfileByUserId(id);
    if (existingProfile) {
        // If profile is already completed, redirect to profile page
        redirect(`/user/${id}/profile`);
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-100 mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-muted-foreground">
                        {currentUser.isRecruiter
                            ? "Help candidates find your organization by completing your profile"
                            : "Build your professional profile to get better interview opportunities"
                        }
                    </p>
                </div>

                <EditProfileForm 
                    user={currentUser} 
                    mode="create"
                />
            </div>
        </div>
    );
};

export default CompleteProfilePage;
