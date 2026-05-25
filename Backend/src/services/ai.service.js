const {GoogleGenAI} = require("@google/genai");
const z = require("zod");
const {zodToJsonSchema, setResponseValueAndErrors} = require("zod-to-json-schema");


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});


const interviewReportSchema = z.object({

    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description, with 100 being a perfect match."),


    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that may be asked in the interview."),
        intention: z.string().describe("The intention of the interviewer behind asking this question."),
        answer: z.string().describe("How to answer the question effectively, including key points to cover and common pitfalls to avoid.")
    })).describe("A list of technical questions that may be asked in the interview, along with the intention behind each question and tips on how to answer them effectively."),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that may be asked in the interview."),
        intention: z.string().describe("The intention of the interviewer behind asking this question."),
        answer: z.string().describe("How to answer the question effectively, including key points to cover and common pitfalls to avoid.")
    })).describe("A list of behavioral questions that may be asked in the interview, along with the intention behind each question and tips on how to answer them effectively."),


    skillGaps: z.array(z.object({
        skill: z.string().describe("The specific skill that the candidate may be lacking based on their resume and self-description."),
        severity: z.enum(["Low", "Medium", "High"]).describe("The severity of the skill gap, indicating how critical it is for the candidate to address this gap before the interview."),
    })).describe("A list of potential skill gaps that the candidate may have based on their resume and self-description, along with an assessment of the severity of each gap."),

    preparationPlan: z.array(z.object({
        day: z.string().describe("The day number in the preparation plan ,starting from Day 1."),
        focus: z.string().describe("The specific focus area for that day, such as a particular technical topic, behavioral question type, or skill to improve."),
        tasks: z.array(z.string()).describe("A list of specific tasks or activities that the candidate should complete on that day to prepare for the interview, such as studying a particular topic, practicing coding problems, or conducting mock interviews.")
    })).describe("A detailed preparation plan for the candidate, outlining specific focus areas and tasks for each day leading up to the interview."),


});




async function generateInterviewReport({resume, selfDescription, jobDescription}) {



    const prompt = `Based on the following information about a candidate and a job description, generate a comprehensive interview report that includes a match score, potential technical and behavioral questions, identified skill gaps, and a detailed preparation plan for the candidate.

Resume: ${resume}
Self-Description: ${selfDescription}
Job Description: ${jobDescription}`;

/**
 * AI model implementation to generate interview report based on the provided prompt and schema.
 * from this we able to change the model and the response structure 
 */


    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        },
    });

    return JSON.parse(response.text);
}



module.exports =  generateInterviewReport 