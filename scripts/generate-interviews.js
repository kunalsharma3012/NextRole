// Load environment variables
require('dotenv').config();

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const initFirebaseAdmin = () => {
    const apps = getApps();

    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    }

    return {
        db: getFirestore(),
    };
};

const { db } = initFirebaseAdmin();

const USER_ID = 'S8dQC9BenyOW7i8G1plREHbCkMg2';

// Mock Interview Structures
const mockInterviews = [
  {
    role: 'Full Stack Developer',
    level: 'Senior',
    type: 'Technical',
    techstack: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    questions: [
      'Walk me through a full-stack application you built from scratch - what technologies did you choose and why?',
      'Describe a complex React component you developed - how did you handle state management and performance?',
      'Tell me about a database design decision you made in one of your projects - SQL vs NoSQL and your reasoning.',
      'Explain a challenging API integration you implemented - REST, GraphQL, or custom solutions?',
      'Share your experience with deployment and DevOps - how do you handle CI/CD in your projects?',
      'Describe a performance optimization you implemented in a full-stack application.',
      'Tell me about your experience with authentication and authorization in your applications.',
      'How do you handle error handling and logging across your full-stack applications?',
      'Describe your testing strategy for both frontend and backend components.',
      'Walk me through your development workflow and tools you use for full-stack development.'
    ],
    categorizedQuestions: {
      technical: [
        'Walk me through a full-stack application you built from scratch - what technologies did you choose and why?',
        'Describe a complex React component you developed - how did you handle state management and performance?',
        'Tell me about a database design decision you made in one of your projects - SQL vs NoSQL and your reasoning.',
        'Explain a challenging API integration you implemented - REST, GraphQL, or custom solutions?',
        'Share your experience with deployment and DevOps - how do you handle CI/CD in your projects?',
        'Describe a performance optimization you implemented in a full-stack application.',
        'Tell me about your experience with authentication and authorization in your applications.',
        'How do you handle error handling and logging across your full-stack applications?',
        'Describe your testing strategy for both frontend and backend components.',
        'Walk me through your development workflow and tools you use for full-stack development.'
      ],
      behavioral: []
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'mock',
    isTemplate: true,
    compulsoryQuestions: 6,
    personalizedQuestions: 4,
    personalizedQuestionPrompt: 'Generate highly personalized technical questions based on the candidate\'s specific full-stack projects, technologies they\'ve worked with, challenges they\'ve faced, and their actual coding experience. Focus on their project architecture decisions, problem-solving approaches, and technical implementations they\'ve built.',
    usageCount: 0
  },
  {
    role: 'Data Scientist',
    level: 'Mid',
    type: 'Mixed',
    techstack: ['Python', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn'],
    questions: [
      'Explain the difference between supervised and unsupervised learning.',
      'How do you handle missing data in datasets?',
      'What is overfitting and how do you prevent it?',
      'Describe your experience working with cross-functional teams.',
      'How do you communicate complex technical concepts to non-technical stakeholders?',
      'Tell me about a time you had to learn a new technology quickly.',
      'What is the bias-variance tradeoff in machine learning?',
      'How do you evaluate the performance of a machine learning model?',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'How do you stay updated with the latest developments in data science?'
    ],
    categorizedQuestions: {
      technical: [
        'Explain the difference between supervised and unsupervised learning.',
        'How do you handle missing data in datasets?',
        'What is overfitting and how do you prevent it?',
        'What is the bias-variance tradeoff in machine learning?',
        'How do you evaluate the performance of a machine learning model?'
      ],
      behavioral: [
        'Describe your experience working with cross-functional teams.',
        'How do you communicate complex technical concepts to non-technical stakeholders?',
        'Tell me about a time you had to learn a new technology quickly.',
        'Describe a challenging project you worked on and how you overcame obstacles.',
        'How do you stay updated with the latest developments in data science?'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'mock',
    isTemplate: true,
    compulsoryQuestions: 5,
    personalizedQuestions: 5,
    personalizedQuestionPrompt: 'Generate questions based on the candidate\'s data science experience, focusing on their specific projects and technical skills.',
    technicalQuestions: 3,
    behavioralQuestions: 2,
    usageCount: 0
  },
  {
    role: 'Product Manager',
    level: 'Senior',
    type: 'Behavioral',
    techstack: ['Agile', 'Scrum', 'JIRA', 'Analytics', 'User Research'],
    questions: [
      'How do you prioritize features in a product roadmap?',
      'Describe a time when you had to make a difficult product decision.',
      'How do you handle conflicts between engineering and business stakeholders?',
      'Tell me about a product launch that didn\'t go as planned.',
      'How do you gather and incorporate user feedback into product development?',
      'Describe your approach to working with cross-functional teams.',
      'How do you measure product success and KPIs?',
      'Tell me about a time you had to pivot a product strategy.',
      'How do you balance technical debt with new feature development?',
      'Describe your experience with A/B testing and data-driven decisions.'
    ],
    categorizedQuestions: {
      technical: [],
      behavioral: [
        'How do you prioritize features in a product roadmap?',
        'Describe a time when you had to make a difficult product decision.',
        'How do you handle conflicts between engineering and business stakeholders?',
        'Tell me about a product launch that didn\'t go as planned.',
        'How do you gather and incorporate user feedback into product development?',
        'Describe your approach to working with cross-functional teams.',
        'How do you measure product success and KPIs?',
        'Tell me about a time you had to pivot a product strategy.',
        'How do you balance technical debt with new feature development?',
        'Describe your experience with A/B testing and data-driven decisions.'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'mock',
    isTemplate: true,
    compulsoryQuestions: 6,
    personalizedQuestions: 4,
    personalizedQuestionPrompt: 'Generate behavioral questions based on the candidate\'s product management experience and specific achievements.',
    usageCount: 0
  },
  {
    role: 'DevOps Engineer',
    level: 'Mid',
    type: 'Technical',
    techstack: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
    questions: [
      'Explain the concept of Infrastructure as Code (IaC).',
      'How do you implement CI/CD pipelines?',
      'What is the difference between containers and virtual machines?',
      'How do you monitor and troubleshoot production systems?',
      'Explain the concept of blue-green deployment.',
      'How do you ensure security in DevOps practices?',
      'What is the role of configuration management in DevOps?',
      'How do you handle secrets and sensitive data in deployment pipelines?',
      'Explain the concept of microservices and their deployment challenges.',
      'How do you implement disaster recovery and backup strategies?'
    ],
    categorizedQuestions: {
      technical: [
        'Explain the concept of Infrastructure as Code (IaC).',
        'How do you implement CI/CD pipelines?',
        'What is the difference between containers and virtual machines?',
        'How do you monitor and troubleshoot production systems?',
        'Explain the concept of blue-green deployment.',
        'How do you ensure security in DevOps practices?',
        'What is the role of configuration management in DevOps?',
        'How do you handle secrets and sensitive data in deployment pipelines?',
        'Explain the concept of microservices and their deployment challenges.',
        'How do you implement disaster recovery and backup strategies?'
      ],
      behavioral: []
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'mock',
    isTemplate: true,
    compulsoryQuestions: 7,
    personalizedQuestions: 3,
    personalizedQuestionPrompt: 'Generate technical questions based on the candidate\'s DevOps experience with cloud platforms and automation tools.',
    usageCount: 0
  }
];

// Job Interview Structures
const jobInterviews = [
  {
    role: 'Junior Full Stack Developer',
    level: 'Entry',
    type: 'Mixed',
    techstack: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    questions: [
      'Tell me about your first full-stack project - what did you build and what challenges did you face?',
      'Walk me through your portfolio website or a personal project you\'re most proud of.',
      'Describe a bug you encountered in your React application and how you debugged it.',
      'Tell me about your experience with APIs - have you built any REST endpoints or consumed third-party APIs?',
      'Share your experience with databases - have you worked with SQL, NoSQL, or both in your projects?',
      'Describe a time when you had to learn a new technology or framework quickly for a project.',
      'Tell me about your development setup and the tools you use for coding.',
      'How do you approach building a new feature from scratch in your projects?',
      'Describe your experience with version control and any collaborative coding projects.',
      'What\'s the most challenging aspect of full-stack development you\'ve encountered in your projects so far?'
    ],
    categorizedQuestions: {
      technical: [
        'Tell me about your first full-stack project - what did you build and what challenges did you face?',
        'Walk me through your portfolio website or a personal project you\'re most proud of.',
        'Describe a bug you encountered in your React application and how you debugged it.',
        'Tell me about your experience with APIs - have you built any REST endpoints or consumed third-party APIs?',
        'Share your experience with databases - have you worked with SQL, NoSQL, or both in your projects?'
      ],
      behavioral: [
        'Describe a time when you had to learn a new technology or framework quickly for a project.',
        'Tell me about your development setup and the tools you use for coding.',
        'How do you approach building a new feature from scratch in your projects?',
        'Describe your experience with version control and any collaborative coding projects.',
        'What\'s the most challenging aspect of full-stack development you\'ve encountered in your projects so far?'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Junior Full Stack Developer',
    responsibilities: 'Develop and maintain web applications, collaborate with senior developers, write clean and maintainable code, and participate in code reviews.',
    ctc: '₹4-8 LPA',
    location: 'Pune, India',
    designation: 'Junior Full Stack Developer',
    isTemplate: true,
    compulsoryQuestions: 5,
    personalizedQuestions: 5,
    personalizedQuestionPrompt: 'Generate highly personalized questions based on the candidate\'s personal projects, internship experience, college projects, and coding experiments. Ask about specific technologies they\'ve used, features they\'ve implemented, problems they\'ve solved, and their hands-on development experience. Focus on their actual coding journey and project-building skills.',
    technicalQuestions: 3,
    behavioralQuestions: 2,
    usageCount: 0
  },
  {
    role: 'Associate Full Stack Developer',
    level: 'Entry',
    type: 'Mixed',
    techstack: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MySQL'],
    questions: [
      'Show me a responsive web application you\'ve built - walk me through your design and development process.',
      'Tell me about a CRUD application you developed - what was the tech stack and what key features did you implement?',
      'Describe your experience with database design - can you walk me through a database schema you created for a project?',
      'Share your experience with form handling and validation in your web applications.',
      'Tell me about your Git workflow and any collaborative projects you\'ve worked on with other developers.',
      'Walk me through the architecture of your most complex web application - how did you structure it?',
      'Describe a coding challenge or bug that took you a while to solve - what was your debugging approach?',
      'Tell me about a time you worked with teammates on a development project - how did you collaborate and divide tasks?',
      'What drew you to full-stack development and how do you stay motivated to keep learning new technologies?',
      'Describe how you handle constructive feedback on your code and implement improvements in your projects.'
    ],
    categorizedQuestions: {
      technical: [
        'Show me a responsive web application you\'ve built - walk me through your design and development process.',
        'Tell me about a CRUD application you developed - what was the tech stack and what key features did you implement?',
        'Describe your experience with database design - can you walk me through a database schema you created for a project?',
        'Share your experience with form handling and validation in your web applications.',
        'Tell me about your Git workflow and any collaborative projects you\'ve worked on with other developers.'
      ],
      behavioral: [
        'Walk me through the architecture of your most complex web application - how did you structure it?',
        'Describe a coding challenge or bug that took you a while to solve - what was your debugging approach?',
        'Tell me about a time you worked with teammates on a development project - how did you collaborate and divide tasks?',
        'What drew you to full-stack development and how do you stay motivated to keep learning new technologies?',
        'Describe how you handle constructive feedback on your code and implement improvements in your projects.'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Associate Full Stack Developer',
    responsibilities: 'Build responsive web applications, work with databases, implement user interfaces, collaborate with team members, and contribute to the full software development lifecycle.',
    ctc: '₹3-6 LPA',
    location: 'Chennai, India',
    designation: 'Associate Full Stack Developer',
    isTemplate: true,
    compulsoryQuestions: 6,
    personalizedQuestions: 4,
    personalizedQuestionPrompt: 'Generate highly personalized questions based on the candidate\'s portfolio projects, academic capstone projects, internship work, and personal coding experiments. Ask about specific features they\'ve implemented, technologies they\'ve explored, coding practices they follow, and their hands-on development experience. Focus on their problem-solving mindset and practical project experience.',
    technicalQuestions: 4,
    behavioralQuestions: 2,
    usageCount: 0
  },
  {
    role: 'Senior Frontend Developer',
    level: 'Senior',
    type: 'Mixed',
    techstack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    questions: [
      'How do you optimize React applications for performance?',
      'Explain the concept of server-side rendering in Next.js.',
      'What are your strategies for handling complex state management?',
      'How do you ensure accessibility in web applications?',
      'Describe your experience with TypeScript and its benefits.',
      'Tell me about a challenging frontend project you led.',
      'How do you handle code reviews and mentor junior developers?',
      'Describe a time when you had to optimize a slow-loading application.',
      'How do you stay updated with the latest frontend technologies?',
      'What is your approach to testing frontend applications?'
    ],
    categorizedQuestions: {
      technical: [
        'How do you optimize React applications for performance?',
        'Explain the concept of server-side rendering in Next.js.',
        'What are your strategies for handling complex state management?',
        'How do you ensure accessibility in web applications?',
        'Describe your experience with TypeScript and its benefits.',
        'What is your approach to testing frontend applications?'
      ],
      behavioral: [
        'Tell me about a challenging frontend project you led.',
        'How do you handle code reviews and mentor junior developers?',
        'Describe a time when you had to optimize a slow-loading application.',
        'How do you stay updated with the latest frontend technologies?'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Senior Frontend Developer',
    responsibilities: 'Lead frontend development initiatives, mentor junior developers, optimize application performance, and collaborate with design and backend teams.',
    ctc: '₹25-30 LPA',
    location: 'Bangalore, India',
    designation: 'Senior Frontend Developer',
    isTemplate: true,
    compulsoryQuestions: 6,
    personalizedQuestions: 4,
    personalizedQuestionPrompt: 'Generate questions based on the candidate\'s frontend development experience, focusing on React, TypeScript, and leadership skills.',
    technicalQuestions: 4,
    behavioralQuestions: 2,
    usageCount: 0
  },
  {
    role: 'Machine Learning Engineer',
    level: 'Mid',
    type: 'Technical',
    techstack: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'AWS SageMaker'],
    questions: [
      'Explain the ML model deployment pipeline you would design.',
      'How do you handle model versioning and experiment tracking?',
      'What are the key considerations for ML model monitoring in production?',
      'Describe your experience with feature engineering and selection.',
      'How do you ensure model reproducibility and reliability?',
      'What is your approach to handling data drift and model decay?',
      'Explain the concept of A/B testing for ML models.',
      'How do you optimize model inference latency and throughput?',
      'Describe your experience with distributed training frameworks.',
      'What are the ethical considerations in ML model development?'
    ],
    categorizedQuestions: {
      technical: [
        'Explain the ML model deployment pipeline you would design.',
        'How do you handle model versioning and experiment tracking?',
        'What are the key considerations for ML model monitoring in production?',
        'Describe your experience with feature engineering and selection.',
        'How do you ensure model reproducibility and reliability?',
        'What is your approach to handling data drift and model decay?',
        'Explain the concept of A/B testing for ML models.',
        'How do you optimize model inference latency and throughput?',
        'Describe your experience with distributed training frameworks.',
        'What are the ethical considerations in ML model development?'
      ],
      behavioral: []
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Machine Learning Engineer',
    responsibilities: 'Design and implement ML pipelines, deploy models to production, optimize model performance, and collaborate with data scientists and engineers.',
    ctc: '₹22-28 LPA',
    location: 'Hyderabad, India',
    designation: 'Machine Learning Engineer',
    isTemplate: true,
    compulsoryQuestions: 8,
    personalizedQuestions: 2,
    personalizedQuestionPrompt: 'Generate technical questions based on the candidate\'s ML engineering experience and specific model deployment projects.',
    usageCount: 0
  },
  {
    role: 'Technical Product Manager',
    level: 'Senior',
    type: 'Behavioral',
    techstack: ['Product Strategy', 'Data Analytics', 'API Design', 'Agile', 'User Research'],
    questions: [
      'How do you balance technical debt with new feature development?',
      'Describe your approach to working with engineering teams on technical decisions.',
      'Tell me about a time you had to make a difficult product tradeoff.',
      'How do you gather and prioritize technical requirements from stakeholders?',
      'Describe your experience with API strategy and developer experience.',
      'How do you handle conflicts between business and engineering priorities?',
      'Tell me about a successful product launch you led.',
      'How do you measure and improve technical product metrics?',
      'Describe your approach to user research and feedback integration.',
      'How do you communicate technical concepts to non-technical stakeholders?'
    ],
    categorizedQuestions: {
      technical: [],
      behavioral: [
        'How do you balance technical debt with new feature development?',
        'Describe your approach to working with engineering teams on technical decisions.',
        'Tell me about a time you had to make a difficult product tradeoff.',
        'How do you gather and prioritize technical requirements from stakeholders?',
        'Describe your experience with API strategy and developer experience.',
        'How do you handle conflicts between business and engineering priorities?',
        'Tell me about a successful product launch you led.',
        'How do you measure and improve technical product metrics?',
        'Describe your approach to user research and feedback integration.',
        'How do you communicate technical concepts to non-technical stakeholders?'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Technical Product Manager',
    responsibilities: 'Lead product strategy for technical products, work closely with engineering teams, define technical requirements, and drive product roadmap execution.',
    ctc: '₹35-45 LPA',
    location: 'Mumbai, India',
    designation: 'Technical Product Manager',
    isTemplate: true,
    compulsoryQuestions: 7,
    personalizedQuestions: 3,
    personalizedQuestionPrompt: 'Generate behavioral questions based on the candidate\'s product management experience with technical products and engineering collaboration.',
    usageCount: 0
  },
  {
    role: 'Cloud Solutions Architect',
    level: 'Senior',
    type: 'Mixed',
    techstack: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Microservices'],
    questions: [
      'Design a scalable cloud architecture for a high-traffic e-commerce application.',
      'How do you ensure security and compliance in cloud deployments?',
      'Explain your approach to multi-cloud strategy and vendor lock-in prevention.',
      'Describe your experience with serverless architectures and their trade-offs.',
      'How do you handle disaster recovery and business continuity in the cloud?',
      'Tell me about a complex cloud migration project you led.',
      'How do you optimize cloud costs while maintaining performance?',
      'Describe your experience mentoring teams on cloud best practices.',
      'How do you stay updated with evolving cloud technologies and services?',
      'What is your approach to infrastructure automation and GitOps?'
    ],
    categorizedQuestions: {
      technical: [
        'Design a scalable cloud architecture for a high-traffic e-commerce application.',
        'How do you ensure security and compliance in cloud deployments?',
        'Explain your approach to multi-cloud strategy and vendor lock-in prevention.',
        'Describe your experience with serverless architectures and their trade-offs.',
        'How do you handle disaster recovery and business continuity in the cloud?',
        'How do you optimize cloud costs while maintaining performance?',
        'What is your approach to infrastructure automation and GitOps?'
      ],
      behavioral: [
        'Tell me about a complex cloud migration project you led.',
        'Describe your experience mentoring teams on cloud best practices.',
        'How do you stay updated with evolving cloud technologies and services?'
      ]
    },
    userId: USER_ID,
    visibility: true,
    interviewCategory: 'job',
    jobTitle: 'Cloud Solutions Architect',
    responsibilities: 'Design and implement cloud architectures, lead cloud migration projects, mentor development teams, and ensure scalable and secure cloud solutions.',
    ctc: '₹40-50 LPA',
    location: 'Pune, India',
    designation: 'Cloud Solutions Architect',
    isTemplate: true,
    compulsoryQuestions: 7,
    personalizedQuestions: 3,
    personalizedQuestionPrompt: 'Generate questions based on the candidate\'s cloud architecture experience, focusing on specific projects and leadership responsibilities.',
    technicalQuestions: 5,
    behavioralQuestions: 2,
    usageCount: 0
  }
];

async function generateInterviewStructures() {
  console.log('🚀 Starting interview structure generation...');
  
  try {
    const batch = db.batch();
    
    console.log(`📝 Generating ${mockInterviews.length} mock interview structures...`);
    
    // Add mock interview structures to 'mock_interview_structures' collection
    for (const interview of mockInterviews) {
      const docRef = db.collection('mock_interview_structures').doc();
      const interviewData = {
        ...interview,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      
      batch.set(docRef, interviewData);
      
      console.log(`✅ Prepared mock interview: ${interview.role} (${interview.type})`);
    }
    
    console.log(`📝 Generating ${jobInterviews.length} job interview structures...`);
    
    // Add job interview structures to 'job_interview_structures' collection
    for (const interview of jobInterviews) {
      const docRef = db.collection('job_interview_structures').doc();
      const interviewData = {
        ...interview,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      
      batch.set(docRef, interviewData);
      
      console.log(`✅ Prepared job interview: ${interview.role} (${interview.type})`);
    }
    
    await batch.commit();
    
    console.log('🎉 Successfully generated all interview structures!');
    
    // Summary
    const mockCount = mockInterviews.length;
    const jobCount = jobInterviews.length;
    const allInterviews = [...mockInterviews, ...jobInterviews];
    const technicalCount = allInterviews.filter(i => i.type === 'Technical').length;
    const behavioralCount = allInterviews.filter(i => i.type === 'Behavioral').length;
    const mixedCount = allInterviews.filter(i => i.type === 'Mixed').length;
    
    console.log('\n📊 Generation Summary:');
    console.log(`   Mock Interviews Collection: ${mockCount} structures`);
    console.log(`   Job Interviews Collection: ${jobCount} structures`);
    console.log(`   Technical: ${technicalCount}`);
    console.log(`   Behavioral: ${behavioralCount}`);
    console.log(`   Mixed: ${mixedCount}`);
    console.log(`   Total: ${allInterviews.length}`);
    
    console.log('\n🔧 Mock Interview Details:');
    mockInterviews.forEach((interview, index) => {
      console.log(`   ${index + 1}. ${interview.role} (${interview.level}) - ${interview.type}`);
      console.log(`      Tech Stack: ${interview.techstack.join(', ')}`);
      console.log(`      Questions: ${interview.compulsoryQuestions} compulsory + ${interview.personalizedQuestions} personalized`);
      console.log('');
    });
    
    console.log('\n🔧 Job Interview Details:');
    jobInterviews.forEach((interview, index) => {
      console.log(`   ${index + 1}. ${interview.role} (${interview.level}) - ${interview.type}`);
      console.log(`      Tech Stack: ${interview.techstack.join(', ')}`);
      console.log(`      Questions: ${interview.compulsoryQuestions} compulsory + ${interview.personalizedQuestions} personalized`);
      console.log(`      Job: ${interview.jobTitle} - ${interview.ctc} - ${interview.location}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error generating interview structures:', error);
    throw error;
  }
}

// Run the script
generateInterviewStructures()
  .then(() => {
    console.log('✨ Interview generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
