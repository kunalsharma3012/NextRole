"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    visibility:
      doc.data().visibility === undefined ? true : doc.data().visibility, // Default to true if not set
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    // Get all finalized interviews except user's own
    const interviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .get();

    // Get ratings for all interviews and filter out private ones
    const interviewsWithRatings = await Promise.all(
      interviews.docs.map(async (doc) => {
        const data = doc.data();
        // Check visibility - default to true if not set
        const visibility =
          data.visibility === undefined ? true : data.visibility;

        // Only include public interviews
        if (!visibility) return null;

        const interview = { id: doc.id, ...data, visibility } as Interview;
        const { averageRating = 0 } = await getAverageInterviewRating(doc.id);
        return { ...interview, averageRating };
      })
    );

    // Filter out null values (private interviews), sort by rating and take top 20
    return interviewsWithRatings
      .filter((interview) => interview !== null)
      .sort((a, b) => (b?.averageRating || 0) - (a?.averageRating || 0))
      .slice(0, limit) as Interview[];
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

export async function getInterviewById(
  id: string,
  requestingUserId?: string
): Promise<Interview | null> {
  // Try to find the interview in both job_interviews and mock_interviews collections
  let interview = await db.collection("job_interviews").doc(id).get();
  
  if (!interview.exists) {
    interview = await db.collection("mock_interviews").doc(id).get();
  }

  // Fallback to old interviews collection for backward compatibility
  if (!interview.exists) {
    interview = await db.collection("interviews").doc(id).get();
  }

  if (!interview.exists) return null;

  const data = interview.data() as Interview;
  // Add visibility field with default value if it doesn't exist
  const visibility = data.visibility === undefined ? true : data.visibility;

  // If the interview is private and the requesting user is not the creator, return null
  if (!visibility && requestingUserId && data.userId !== requestingUserId) {
    return null;
  }

  return { ...data, id: interview.id, visibility } as Interview;
}

export async function getUserTakenInterviews(
  userId: string
): Promise<Interview[]> {
  try {
    // Get all feedback documents for this user
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .get();

    if (feedbackSnapshot.empty) {
      return [];
    }

    // Extract interview IDs from feedback
    const interviewIds = feedbackSnapshot.docs.map((doc) => {
      const data = doc.data();
      return data.interviewId;
    });

    // Get unique interview IDs
    const uniqueInterviewIds = [...new Set(interviewIds)];

    // Fetch all interviews
    const interviews = await Promise.all(
      uniqueInterviewIds.map(async (id) => {
        const interviewDoc = await db.collection("interviews").doc(id).get();
        if (interviewDoc.exists) {
          return { id: interviewDoc.id, ...interviewDoc.data() } as Interview;
        }
        return null;
      })
    );

    // Filter out null values and interviews created by the user
    return interviews
      .filter(
        (interview): interview is Interview =>
          interview !== null && interview.userId !== userId
      )
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  } catch (error) {
    console.error("Error fetching taken interviews:", error);
    return [];
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;
  console.log("here");
  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("here1");
    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    console.log("here2");
    const check = await getFeedbackByInterviewId({ interviewId, userId });
    console.log("here3");
    if (check) {
      if (check.totalScore > totalScore) {
        // Previous score was more
        return {
          success: true,
          feedbackId: check.id,
          score: totalScore,
        };
      } else {
        // Updating previous score
        await db.collection("feedback").doc(check.id).update({
          totalScore,
          categoryScores,
          strengths,
          areasForImprovement,
          finalAssessment,
          createdAt: new Date().toISOString(),
        });

        return {
          success: true,
          feedbackId: check.id,
        };
      }
    }
    console.log("here4");
    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    console.log("here5");
    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.error("Error saving feedback:", error);

    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) {
    return null;
  }

  const feedbackDoc = feedback.docs[0];

  return {
    id: feedbackDoc.id,
    ...feedbackDoc.data(),
  } as Feedback;
}

export async function saveInterviewRating({
  feedbackId,
  interviewId,
  userId,
  rating,
}: {
  feedbackId?: string;
  interviewId?: string;
  userId?: string;
  rating: number;
}) {
  try {
    let targetFeedbackId = feedbackId;

    // If feedbackId is not provided, try to find it using interviewId and userId
    if (!targetFeedbackId && interviewId && userId) {
      const feedback = await getFeedbackByInterviewId({ interviewId, userId });
      if (feedback) {
        targetFeedbackId = feedback.id;
      } else {
        return {
          success: false,
          error: "Feedback not found",
        };
      }
    }

    if (!targetFeedbackId) {
      return {
        success: false,
        error: "Feedback ID is required",
      };
    }

    // Update the feedback document with the user's rating
    await db.collection("feedback").doc(targetFeedbackId).update({
      userRating: rating,
    });

    return {
      success: true,
      feedbackId: targetFeedbackId,
    };
  } catch (error) {
    console.error("Error saving rating:", error);
    return {
      success: false,
      error: "Failed to save rating",
    };
  }
}

export async function getAverageInterviewRating(interviewId: string) {
  try {
    // Query all feedback documents with the given interviewId
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    if (feedbackSnapshot.empty) {
      return {
        success: false,
        error: "No feedback found for this interview",
        averageRating: 0,
      };
    }

    let totalRating = 0;
    let ratingCount = 0;

    // Calculate the sum of all ratings
    feedbackSnapshot.forEach((doc) => {
      const feedback = doc.data() as Feedback;
      if (feedback.userRating !== undefined) {
        totalRating += feedback.userRating;
        ratingCount++;
      }
    });

    // Calculate the average rating
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return {
      success: true,
      averageRating,
      ratingCount,
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return {
      success: false,
      error: "Failed to calculate average rating",
      averageRating: 0,
    };
  }
}

export async function updateInterview({
  id,
  role,
  questions,
  userId,
  visibility,
}: {
  id: string;
  role: string;
  questions: string[];
  userId: string;
  visibility?: boolean;
}) {
  try {
    // Validate input
    if (
      !id ||
      !role ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0 ||
      !userId
    ) {
      return {
        success: false,
        error: "Invalid input",
      };
    }

    // Get the interview to check ownership
    const interview = await getInterviewById(id, userId);
    if (!interview) {
      return {
        success: false,
        error: "Interview not found",
      };
    }

    // Check if the user is the owner of the interview
    if (interview.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Prepare update object
    const updateData: Record<string, unknown> = {
      role,
      questions,
    };

    // Only add visibility to update if it's explicitly provided
    if (visibility !== undefined) {
      updateData.visibility = visibility;
    }

    // Update the interview in Firestore
    await db.collection("interviews").doc(id).update(updateData);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating interview:", error);
    return {
      success: false,
      error: "Failed to update interview",
    };
  }
}

// Profile completion actions
export async function saveProfile(userId: string, profileData: object) {
  try {
    // Create a profile document in a profiles collection
    await db
      .collection("profiles")
      .doc(userId)
      .set({
        ...profileData,
        userId,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    // Update the user document to mark profile as completed
    await db.collection("users").doc(userId).update({
      profileCompleted: true,
    });

    return {
      success: true,
      message: "Profile saved successfully",
    };
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      success: false,
      message: "Failed to save profile",
    };
  }
}

export async function getProfileByUserId(userId: string) {
  try {
    const profileDoc = await db.collection("profiles").doc(userId).get();

    if (!profileDoc.exists) {
      return null;
    }

    return {
      id: profileDoc.id,
      ...profileDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfile(userId: string, profileData: object) {
  try {
    await db
      .collection("profiles")
      .doc(userId)
      .update({
        ...profileData,
        updatedAt: new Date().toISOString(),
      });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}

// Profile completion check utility
export async function checkProfileCompletion(userId: string) {
  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) return false;
    
    // Check if profile has completion percentage and is 100%
    return profile.completionPercentage === 100;
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}

// Add profile completion notification for better UX
export async function getProfileCompletionStatus(userId: string) {
  try {
    const profile = await getProfileByUserId(userId);
    return {
      isCompleted: !!profile,
      profile: profile,
    };
  } catch (error) {
    console.error("Error checking profile completion status:", error);
    return {
      isCompleted: false,
      profile: null,
    };
  }
}

// Get public mock interview structures
export async function getPublicMockInterviewStructures(
  limit: number = 10
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("mock_interview_structures")
      .where("visibility", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching public mock interview structures:", error);
    return null;
  }
}

// Get public job interview structures
export async function getPublicJobInterviewStructures(
  limit: number = 10
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("job_interview_structures")
      .where("visibility", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching public job interview structures:", error);
    return null;
  }
}

// Get all public interview structures (both mock and job)
export async function getPublicInterviewStructures(
  mockLimit: number = 10,
  jobLimit: number = 10
): Promise<{
  mockStructures: InterviewStructure[] | null;
  jobStructures: InterviewStructure[] | null;
}> {
  try {
    const [mockStructures, jobStructures] = await Promise.all([
      getPublicMockInterviewStructures(mockLimit),
      getPublicJobInterviewStructures(jobLimit),
    ]);

    return {
      mockStructures,
      jobStructures,
    };
  } catch (error) {
    console.error("Error fetching public interview structures:", error);
    return {
      mockStructures: null,
      jobStructures: null,
    };
  }
}

// Get user's created mock interview structures
export async function getUserMockInterviewStructures(
  userId: string
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("mock_interview_structures")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching user mock interview structures:", error);
    return null;
  }
}

// Get user's created job interview structures
export async function getUserJobInterviewStructures(
  userId: string
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("job_interview_structures")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching user job interview structures:", error);
    return null;
  }
}

// Get user's taken interview structures (from taken interviews)
export async function getUserTakenInterviewStructures(
  userId: string
): Promise<InterviewStructure[] | null> {
  try {
    // Get all taken interviews for the user
    const takenInterviews = await getUserTakenInterviews(userId);
    
    if (!takenInterviews || takenInterviews.length === 0) {
      return [];
    }

    // Extract unique structure IDs from taken interviews
    const structureIds = [...new Set(takenInterviews
      .map(interview => interview.structureId)
      .filter(id => id !== undefined)
    )] as string[];
    
    // Get all structures from both collections with visibility filtering
    const structurePromises = structureIds.map(async (structureId) => {
      // Try mock structures first
      let structureDoc = await db.collection('mock_interview_structures').doc(structureId).get();
      
      if (structureDoc.exists) {
        const data = structureDoc.data();
        // Only return if visibility is true (public)
        if (data?.visibility === true) {
          return {
            id: structureDoc.id,
            ...data,
          } as InterviewStructure;
        }
        return null;
      }
      
      // Try job structures
      structureDoc = await db.collection('job_interview_structures').doc(structureId).get();
      
      if (structureDoc.exists) {
        const data = structureDoc.data();
        // Only return if visibility is true (public)
        if (data?.visibility === true) {
          return {
            id: structureDoc.id,
            ...data,
          } as InterviewStructure;
        }
        return null;
      }
      
      return null;
    });

    const structures = await Promise.all(structurePromises);
    return structures.filter(structure => structure !== null) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching user taken interview structures:", error);
    return null;
  }
}

// Get all user's interview structures based on user type
export async function getUserInterviewStructures(
  userId: string,
  isRecruiter: boolean,
  isOwnProfile: boolean = true
): Promise<{
  takenStructures: InterviewStructure[] | null;
  createdMockStructures: InterviewStructure[] | null;
  createdJobStructures: InterviewStructure[] | null;
}> {
  try {
    const promises = [
      getUserTakenInterviewStructures(userId),
      isOwnProfile ? getUserMockInterviewStructures(userId) : getPublicUserMockInterviewStructures(userId),
      isRecruiter ? (isOwnProfile ? getUserJobInterviewStructures(userId) : getPublicUserJobInterviewStructures(userId)) : Promise.resolve(null),
    ];

    const [takenStructures, createdMockStructures, createdJobStructures] = await Promise.all(promises);

    return {
      takenStructures,
      createdMockStructures,
      createdJobStructures,
    };
  } catch (error) {
    console.error("Error fetching user interview structures:", error);
    return {
      takenStructures: null,
      createdMockStructures: null,
      createdJobStructures: null,
    };
  }
}

// Get user's public mock interview structures (for viewing other users' profiles)
export async function getPublicUserMockInterviewStructures(
  userId: string
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("mock_interview_structures")
      .where("userId", "==", userId)
      .where("visibility", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching user public mock interview structures:", error);
    return null;
  }
}

// Get user's public job interview structures (for viewing other users' profiles)
export async function getPublicUserJobInterviewStructures(
  userId: string
): Promise<InterviewStructure[] | null> {
  try {
    const structures = await db
      .collection("job_interview_structures")
      .where("userId", "==", userId)
      .where("visibility", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    return structures.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewStructure[];
  } catch (error) {
    console.error("Error fetching user public job interview structures:", error);
    return null;
  }
}
