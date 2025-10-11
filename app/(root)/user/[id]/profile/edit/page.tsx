import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getProfileByUserId } from '@/lib/actions/general.actions';
import EditProfileForm from '@/components/user/EditProfileForm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const EditProfilePage = async ({ params }: RouteParams) => {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    // Redirect if not authenticated
    if (!currentUser) {
        redirect('/sign-in');
    }

    // Only allow users to edit their own profile
    if (currentUser.id !== id) {
        redirect('/');
    }

    // Check if profile exists
    const existingProfile = await getProfileByUserId(id);
    if (!existingProfile) {
        // If profile doesn't exist, redirect to complete profile page
        redirect(`/user/${id}/profile/complete`);
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-100 mb-2">
                        Edit Your Profile
                    </h1>
                    <p className="text-muted-foreground">
                        {currentUser.isRecruiter
                            ? "Update your company information to attract top talent"
                            : "Keep your professional profile up to date"
                        }
                    </p>
                </div>

                <EditProfileForm 
                    user={currentUser} 
                    existingProfile={existingProfile} 
                    mode="edit"
                />
            </div>
        </div>
    );
};

export default EditProfilePage;
