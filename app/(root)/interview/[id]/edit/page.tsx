import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/general.actions';
import { redirect } from 'next/navigation';
import EditInterview from '@/components/interview/EditInterview';
import { getTechLogos } from '@/lib/utils';

export default async function EditInterviewPage({params } : RouteParams) {
  // Get the id from params
  const { id } = await params;
  
  // Fetch the interview data using server action
  const interview = await getInterviewById(id);
  const user = await getCurrentUser();
  
  // Redirect if interview not found or user is not authorized
  if (!interview) redirect('/');
  if (!user || user.id !== interview.userId) redirect(`/interview/${id}`);
  
  // Get a tech logo for display
  let techLogo = '/tech.svg';
  if (interview.techstack?.length) {
    const logos = await getTechLogos([interview.techstack[Math.floor(Math.random() * interview.techstack.length)]]);
    techLogo = logos[0].url;
  }
  
  return (
    <EditInterview 
      interview={interview} 
      techLogo={techLogo} 
      id={id} 
      userId={user.id} // Pass the userId to the component
    />
  );
}