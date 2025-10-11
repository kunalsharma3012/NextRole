'use client';

import { useState, useEffect } from 'react';
import RatingModal from './RatingModal';
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { saveInterviewRating } from '@/lib/actions/general.actions';

interface FeedbackWithRatingProps {
  feedback: Feedback; // Replace with your Feedback type
  interview: Interview; // Replace with your Interview type
  id: string;
  isOwner:boolean;
}

const FeedbackWithRating = ({ feedback, interview, id,isOwner }: FeedbackWithRatingProps) => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    // Check if feedback was created today or within the last hour
    if (feedback?.createdAt) {
      const feedbackDate = new Date(feedback.createdAt);
      const currentDate = new Date();
      
      // Check if same day (today)
      const isSameDay = (
        feedbackDate.getDate() === currentDate.getDate() &&
        feedbackDate.getMonth() === currentDate.getMonth() &&
        feedbackDate.getFullYear() === currentDate.getFullYear()
      );
      
      // Check if within the last 10 mins
      const timeDifferenceMs = currentDate.getTime() - feedbackDate.getTime();
      const oneHourMs = 10 * 60 * 1000; // 10 mins in milliseconds
      const isWithinLastHour = timeDifferenceMs < oneHourMs;
      
      // Show modal if either condition is met
      if (isSameDay && isWithinLastHour) {
        setIsRatingModalOpen(true);
      }
    }
  }, []);

  // Then in your component:
  const handleRatingSubmit = async (rating: number) => {
    // Save the rating to your database
    const result = await saveInterviewRating({
      interviewId: id,
      userId: feedback.userId, // Make sure this is available in your feedback object
      rating: rating
    });
    
    // if (result.success) {
    //   console.log('Rating submitted successfully:', rating);
    // } else {
    //   console.error('Failed to submit rating:', result.error);
    // }
    
    // Close the modal after submission
    setIsRatingModalOpen(false);
    
  };

  return (
    <>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
        }}
        onSubmit={handleRatingSubmit}
      />
      
      <section className="section-feedback">
        <div className="flex flex-row justify-center">
          <h1 className="text-4xl font-semibold">
            Feedback on the Interview -{" "}
            <span className="capitalize">{interview.role}</span> Interview
          </h1>
        </div>

        <div className="flex flex-row justify-center ">
          <div className="flex flex-row gap-5">
            {/* Overall Impression */}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                Overall Impression:{" "}
                <span className="text-primary-200 font-bold">
                  {feedback?.totalScore}
                </span>
                /100
              </p>
            </div>

            {/* Date */}
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
              <p>
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <hr />

        <p>{feedback?.finalAssessment}</p>

        {/* Interview Breakdown */}
        <div className="flex flex-col gap-4">
          <h2>Breakdown of the Interview:</h2>
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index}>
              <p className="font-bold">
                {index + 1}. {category.name} ({category.score}/100)
              </p>
              <p>{category.comment}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3>Strengths</h3>
          <ul>
            {feedback?.strengths?.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3>Areas for Improvement</h3>
          <ul>
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>

        <div className="buttons">
          <Button className="btn-secondary flex-1">
            <Link href="/" className="flex w-full justify-center">
              <p className="text-sm font-semibold text-primary-200 text-center">
                Back to dashboard
              </p>
            </Link>
          </Button>

          {isOwner &&  <Button className="btn-primary flex-1">
            <Link
              href={`/interview/${id}`}
              className="flex w-full justify-center"
            >
              <p className="text-sm font-semibold text-black text-center">
                Retake Interview
              </p>
            </Link>
          </Button> }
         
        </div>
      </section>
    </>
  );
};

export default FeedbackWithRating;