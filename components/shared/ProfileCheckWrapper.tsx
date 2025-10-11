'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { checkProfileCompletion } from '@/lib/actions/general.actions';

interface ProfileCheckWrapperProps {
    userId: string;
    targetUrl: string;
    children: React.ReactNode;
    className?: string;
}

const ProfileCheckWrapper = ({ userId, targetUrl, children, className }: ProfileCheckWrapperProps) => {
    const router = useRouter();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            const isProfileCompleted = await checkProfileCompletion(userId);

            if (!isProfileCompleted) {
                toast.error('Please complete your profile first');
                router.push(`/user/${userId}/profile/complete`);
                return;
            }

            // If profile is completed, navigate to the target URL
            router.push(targetUrl);
        } catch (error) {
            console.error('Error checking profile completion:', error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className={className} onClick={handleClick}>
            {children}
        </div>
    );
};

export default ProfileCheckWrapper;
