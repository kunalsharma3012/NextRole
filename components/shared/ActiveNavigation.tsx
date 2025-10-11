'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ActiveNavigationProps {
  user: User | null;
}

const ActiveNavigation = ({ user }: ActiveNavigationProps) => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/discover', label: 'Discover' },
    { href: '/create-interview', label: 'Create Interview' },
    ...(user ? [{ href: `/user/${user.id}/interviews`, label: 'My Interviews' }] : [])
  ]

  return (
    <div className="flex items-center gap-6 ml-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`px-4 font-medium transition-all duration-200 relative ${
              isActive 
                ? 'text-white bg-primary-500/30 shadow-lg' 
                : 'text-primary-300 hover:text-primary-100 hover:bg-primary-500/10'
            }`}
          >
            {item.label}
            {isActive && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-7 h-0.5 bg-white rounded-full shadow-lg" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default ActiveNavigation
