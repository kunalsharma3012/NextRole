
import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import SignOut from '@/components/auth/SignOut'
import ActiveNavigation from '@/components/shared/ActiveNavigation'

const RootLayout = async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  const user = await getCurrentUser();

  if(!isUserAuthenticated) redirect('/sign-in');

  // Get user's initial for avatar and color
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const avatarColor = user?.avatarColor || 'bg-blue-500'; // Default to blue if no color is set

  return (
    <div className='root-layout' >
      <nav className='flex items-center justify-between' >
        <>
          <Link href="/" className='flex items-center gap-2'>
          
          <Image src="/logo.svg" alt='Logo' width={38} height={32} />

            <h2 className="text-primary-100" >NextRole</h2>
          </Link>
          
          <ActiveNavigation user={user} />
        </>

        <div className="flex items-center gap-4">
          <Link href={`/user/${user?.id}/profile`} className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-dark-100/20`}>
              {userInitial}
            </div>
          </Link>
          <SignOut />
        </div>
        
      </nav>
      {children}
    </div>
  )
}

export default RootLayout