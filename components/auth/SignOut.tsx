'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth.action'
import { toast } from 'sonner'

const SignOut = () => {

    const handleSignOut = async ()=>{
        await signOut();
        toast("Signed out Successfully")
    }

  return (
    <Button className="btn-primary" onClick={handleSignOut} >Sign out</Button>
  )
}

export default SignOut