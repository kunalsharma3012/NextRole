import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
    try {
        const { 
            type, role, level, techstack, 
            interviewCategory, jobTitle, responsibilities, ctc, location, designation,
            compulsoryQuestions, personalizedQuestions, regenerate,
            technicalQuestions: technicalCount, behavioralQuestions: behavioralCount
        } = await request.json();

        let questions;
        let categorizedQuestions = null;
        
        // Only generate compulsory questions since personalized ones will be generated during interview
        const questionsToGenerate = compulsoryQuestions;

        if (type === 'mixed') {
            // For mixed interviews, use the specific technical and behavioral counts
            const behavioralAmount = behavioralCount || Math.ceil(questionsToGenerate / 2);
            const technicalAmount = technicalCount || Math.floor(questionsToGenerate / 2);

            // Generate behavioral questions
            const { text: behavioralQuestionsText } = await generateText({
                model: google("gemini-2.0-flash-001"),
                prompt: `${regenerate ? 'Regenerate completely new and different behavioral questions' : 'Generate behavioral questions'} for a job interview.
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
                
                ${regenerate ? 'Make sure these behavioral questions are completely different from any previous set.' : ''}
                
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
                prompt: `${regenerate ? 'Regenerate completely new and different technical questions' : 'Generate technical questions'} for a job interview.
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
                
                ${regenerate ? 'Make sure these technical questions are completely different from any previous set.' : ''}
                
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
                prompt: `${regenerate ? 'Regenerate completely new and different questions' : 'Generate questions'} for a job interview.
                The job role is ${role}.
                The job experience level is ${level}.
                ${type === 'technical' ? `The tech stack used in the job is: ${techstack}.` : ''}
                The amount of questions required is: ${questionsToGenerate}.
                ${interviewCategory === 'job' ? `
                This is for an actual job opening with these details:
                - Job Title: ${jobTitle}
                - Designation: ${designation}
                - Location: ${location}
                - CTC: ${ctc}
                - Key Responsibilities: ${responsibilities}
                
                Please tailor the questions to be specific to this job opening and its requirements.
                ` : 'This is a mock interview for practice purposes.'}
                
                ${regenerate ? 'Make sure these questions are completely different from any previous set of questions for the same role and requirements.' : ''}
                
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

        return Response.json({
            success: true,
            questions,
            categorizedQuestions,
            compulsoryCount: questionsToGenerate,
            personalizedCount: personalizedQuestions || 0,
            message: `Generated ${questionsToGenerate} compulsory questions${personalizedQuestions > 0 ? ` (${personalizedQuestions} personalized questions will be generated during interview)` : ''}`
        }, { status: 200 });
    } catch (error) {
        console.error('Error generating questions:', error);
        return Response.json({
            success: false,
            error: 'Failed to generate questions'
        }, { status: 500 });
    }
}
