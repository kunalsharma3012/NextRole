import React from 'react'
import { Button } from '@/components/ui/button'
import Image from "next/image"
import ProfileCheckWrapper from '@/components/shared/ProfileCheckWrapper'

interface HeroSectionProps {
  user: User
}

const HeroSection = ({ user }: HeroSectionProps) => {
  const isRecruiter = user.isRecruiter;

  return (
    <section className="card-cta">
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>
          {isRecruiter 
            ? "Hire Smarter with AI-Powered Interviews" 
            : "Ace Your Next Interview with AI"
          }
        </h2>
        <p className="text-lg">
          {isRecruiter 
            ? "Transform your hiring with intelligent AI-powered job interviews. Get real-time candidate insights, detailed analytics, and automated feedback to find top talent faster than ever."
            : "Practice with AI-powered mock interviews that simulate real scenarios. Get instant feedback, personalized coaching, and take actual job interviews to land your dream role."
          }
        </p>

        <ProfileCheckWrapper 
          userId={user.id} 
          targetUrl="/interview"
          className="max-sm:w-full"
        >
          <Button className="btn-primary max-sm:w-full">
            {isRecruiter ? "Start Smart Hiring" : "Start Practicing Now"}
          </Button>
        </ProfileCheckWrapper>
      </div>

      <Image
        src="/robot.png"
        alt="robo-dude"
        width={400}
        height={400}
        className="max-sm:hidden"
      />
    </section>
  )
}

export default HeroSection
