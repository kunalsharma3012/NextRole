import {generateText} from "ai";
import {google} from "@ai-sdk/google"
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET(){
    return Response.json({
        success:true , data: 'THANK YOU!'
    }, {status:200});
}


export async function POST(request: Request) {
    const { 
        type, role, level, techstack, amount, userid, visibility, 
        interviewCategory, jobTitle, responsibilities, ctc, location, designation 
    } = await request.json();
    
    console.log("I am here-->", userid);
    
    try {
        let questions;
        let categorizedQuestions = null;

        if (type === 'mixed') {
            // For mixed interviews, generate both behavioral and technical questions
            const behavioralAmount = Math.ceil(amount / 2);
            const technicalAmount = Math.floor(amount / 2);

            // Generate behavioral questions
            const { text: behavioralQuestionsText } = await generateText({
                model: google("gemini-2.0-flash-001"),
                prompt: `Prepare behavioral questions for a job interview.
                The job role is ${role}.
                The job experience level is ${level}.
                The amount of questions required is: ${behavioralAmount}.
                ${interviewCategory === 'job' ? `
                This is for an actual job opening with these details:
                - Job Title: ${jobTitle}
                - Designation: ${designation}
                - Location: ${location}
                - CTC: ${ctc}
                - Key Responsibilities: ${responsibilities}
                
                Please tailor the behavioral questions to be relevant to this job opening.
                ` : 'This is a mock interview for practice purposes.'}
                
                Focus on behavioral questions that assess soft skills, past experiences, teamwork, leadership, problem-solving approach, etc.
                Please return only the questions, without any additional text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]
                
                Thank you! <3
            `,
            });

            // Generate technical questions
            const { text: technicalQuestionsText } = await generateText({
                model: google("gemini-2.0-flash-001"),
                prompt: `Prepare technical questions for a job interview.
                The job role is ${role}.
                The job experience level is ${level}.
                The tech stack used in the job is: ${techstack}.
                The amount of questions required is: ${technicalAmount}.
                ${interviewCategory === 'job' ? `
                This is for an actual job opening with these details:
                - Job Title: ${jobTitle}
                - Designation: ${designation}
                - Location: ${location}
                - CTC: ${ctc}
                - Key Responsibilities: ${responsibilities}
                
                Please tailor the technical questions to be specific to this job opening and its tech stack.
                ` : 'This is a mock interview for practice purposes.'}
                
                Focus on technical questions related to the specified tech stack, coding problems, system design, technical concepts, etc.
                Please return only the questions, without any additional text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]
                
                Thank you! <3
            `,
            });

            const behavioralQuestions = JSON.parse(behavioralQuestionsText);
            const technicalQuestions = JSON.parse(technicalQuestionsText);
            
            questions = [...behavioralQuestions, ...technicalQuestions];
            categorizedQuestions = {
                behavioral: behavioralQuestions,
                technical: technicalQuestions
            };
        } else {
            // For single type interviews (behavioral or technical only)
            const { text: questionsText } = await generateText({
                model: google("gemini-2.0-flash-001"),
                prompt: `Prepare ${type} questions for a job interview.
                The job role is ${role}.
                The job experience level is ${level}.
                ${type === 'technical' ? `The tech stack used in the job is: ${techstack}.` : ''}
                The amount of questions required is: ${amount}.
                ${interviewCategory === 'job' ? `
                This is for an actual job opening with these details:
                - Job Title: ${jobTitle}
                - Designation: ${designation}
                - Location: ${location}
                - CTC: ${ctc}
                - Key Responsibilities: ${responsibilities}
                
                Please tailor the questions to be specific to this job opening and its requirements.
                ` : 'This is a mock interview for practice purposes.'}
                
                ${type === 'behavioral' 
                    ? 'Focus on behavioral questions that assess soft skills, past experiences, teamwork, leadership, problem-solving approach, etc.'
                    : 'Focus on technical questions related to the specified tech stack, coding problems, system design, technical concepts, etc.'
                }
                Please return only the questions, without any additional text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]
                
                Thank you! <3
            `,
            });

            questions = JSON.parse(questionsText);
        }

        const interview = {
            role, 
            level, 
            type, 
            techstack: techstack.split(','), 
            questions,
            ...(categorizedQuestions && { categorizedQuestions }),
            userId: userid, 
            finalized: true,
            visibility: visibility !== undefined ? visibility : false,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            // Add job-specific fields if it's a job interview
            ...(interviewCategory === 'job' ? {
                interviewCategory,
                jobTitle,
                responsibilities,
                ctc,
                location,
                designation
            } : {
                interviewCategory: interviewCategory || 'mock'
            })
        };

        // Use different collections for mock and job interviews
        const collectionName = interviewCategory === 'job' ? 'jobInterviews' : 'mockInterviews';
        await db.collection(collectionName).add(interview);

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error }, { status: 500 });
    }
}