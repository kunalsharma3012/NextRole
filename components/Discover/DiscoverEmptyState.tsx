import React from 'react'
import Image from "next/image"

interface DiscoverEmptyStateProps {
  title: string
  description?: string
}

const DiscoverEmptyState = ({ title, description }: DiscoverEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center w-full">
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed border-primary-500/30 bg-primary-500/10">
        <Image
          src="/tech.svg"
          alt="Empty state"
          width={32}
          height={32}
          className="opacity-70 filter brightness-110"
        />
      </div>
    </div>
    <h3 className="text-lg font-medium text-primary-100 mb-2">{title}</h3>
    {description && (
      <p className="text-primary-300 text-sm max-w-md leading-relaxed mb-4">{description}</p>
    )}
  </div>
)

export default DiscoverEmptyState
