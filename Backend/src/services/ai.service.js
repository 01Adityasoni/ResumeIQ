const {GoogleGenAI} = require("@google/genai");
const z = require("zod");
const {zodToJsonSchema} = require("zod-to-json-schema");


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const finalInterviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
    })).min(1),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
    })).min(1),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
    })).min(1),
    preparationPlan: z.array(z.object({
        day: z.number().int().positive(),
        focus: z.string(),
        tasks: z.array(z.string()).min(1),
    })).min(1),
    title: z.string().min(1),
});

function parseMaybeJson(value) {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return value;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
}

function inferQuestionMeta(questionText, type) {
    const q = String(questionText || '').toLowerCase();

    if (type === 'behavioral') {
        if (q.includes('conflict') || q.includes('disagreement')) {
            return {
                intention: 'Evaluate collaboration, communication, and conflict-resolution maturity.',
                answer: 'Use STAR: describe the conflict, your actions, how you aligned on a solution, and the measurable outcome.',
            };
        }

        if (q.includes('failure') || q.includes('mistake')) {
            return {
                intention: 'Assess ownership, learning mindset, and accountability.',
                answer: 'Pick a real mistake, explain the impact, show corrective steps, and end with what process change you adopted.',
            };
        }

        if (q.includes('pressure') || q.includes('deadline')) {
            return {
                intention: 'Check prioritization, resilience, and execution under constraints.',
                answer: 'Explain how you prioritized tasks, communicated trade-offs, and delivered key scope on time with quality.',
            };
        }

        return {
            intention: 'Assess behavioral fit, communication style, and consistency in past performance.',
            answer: 'Respond with a structured STAR example, quantify impact, and end with a reflection on what you learned.',
        };
    }

    if (q.includes('node') || q.includes('event loop')) {
        return {
            intention: 'Evaluate practical Node.js fundamentals and runtime understanding.',
            answer: 'Explain the event loop, async patterns, and give a production example where you improved throughput or latency.',
        };
    }

    if (q.includes('express') || q.includes('api') || q.includes('rest')) {
        return {
            intention: 'Check backend API design, validation, and error-handling depth.',
            answer: 'Describe your route/controller/service layering, request validation, HTTP status strategy, and how you version APIs.',
        };
    }

    if (q.includes('mongo') || q.includes('mongoose') || q.includes('database')) {
        return {
            intention: 'Assess data modeling, query optimization, and indexing decisions.',
            answer: 'Explain schema design trade-offs, key indexes used, and how you measured and improved query performance.',
        };
    }

    if (q.includes('jwt') || q.includes('auth') || q.includes('authorization')) {
        return {
            intention: 'Evaluate security awareness and authentication architecture.',
            answer: 'Cover token lifecycle, refresh strategy, secure cookie usage, role checks, and mitigation of token leakage.',
        };
    }

    return {
        intention: 'Assess technical depth, design thinking, and trade-off awareness.',
        answer: 'Start with fundamentals, walk through your implementation approach, discuss trade-offs, and finish with a concrete project example.',
    };
}

function normalizeQuestion(item, type) {
    const fallbackMeta = type === 'behavioral'
        ? {
            intention: 'Assess behavioral fit, communication style, and consistency in past performance.',
            answer: 'Respond with a structured STAR example, quantify impact, and end with a reflection on what you learned.',
        }
        : {
            intention: 'Assess technical depth, design thinking, and trade-off awareness.',
            answer: 'Start with fundamentals, walk through your implementation approach, discuss trade-offs, and finish with a concrete project example.',
        };

    if (typeof item === 'string') {
        const parsed = parseMaybeJson(item);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const question = String(parsed.question || '').trim();
            return {
                question,
                intention: String(parsed.intention || parsed.intension || fallbackMeta.intention).trim(),
                answer: String(parsed.answer || fallbackMeta.answer).trim(),
            };
        }

        const question = String(parsed).trim();
        return {
            question,
            intention: inferQuestionMeta(question, type).intention,
            answer: inferQuestionMeta(question, type).answer,
        };
    }

    const question = String(item?.question || '').trim();
    return {
        question,
        intention: String(item?.intention || item?.intension || fallbackMeta.intention).trim(),
        answer: String(item?.answer || fallbackMeta.answer).trim(),
    };
}

function normalizeSkillGap(item) {
    if (typeof item === 'string') {
        const parsed = parseMaybeJson(item);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const severityRaw = String(parsed.severity || 'medium').toLowerCase();
            const severity = ['low', 'medium', 'high'].includes(severityRaw) ? severityRaw : 'medium';

            return {
                skill: String(parsed.skill || '').trim(),
                severity,
            };
        }

        return {
            skill: String(parsed).trim(),
            severity: 'medium',
        };
    }

    const severityRaw = String(item?.severity || 'medium').toLowerCase();
    const severity = ['low', 'medium', 'high'].includes(severityRaw) ? severityRaw : 'medium';

    return {
        skill: String(item?.skill || '').trim(),
        severity,
    };
}

function normalizePreparationDay(item, index) {
    if (typeof item === 'string') {
        const parsed = parseMaybeJson(item);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const dayValue = Number.parseInt(parsed.day, 10);

            return {
                day: Number.isFinite(dayValue) && dayValue > 0 ? dayValue : index + 1,
                focus: String(parsed.focus || '').trim(),
                tasks: Array.isArray(parsed.tasks)
                    ? parsed.tasks.map((task) => String(task).trim()).filter(Boolean)
                    : ['Revise concepts related to this focus area.'],
            };
        }

        return {
            day: index + 1,
            focus: String(parsed).trim(),
            tasks: ['Revise concepts related to this focus area.'],
        };
    }

    const dayValue = Number.parseInt(item?.day, 10);

    return {
        day: Number.isFinite(dayValue) && dayValue > 0 ? dayValue : index + 1,
        focus: String(item?.focus || '').trim(),
        tasks: Array.isArray(item?.tasks)
            ? item.tasks.map((task) => String(task).trim()).filter(Boolean)
            : ['Revise concepts related to this focus area.'],
    };
}

function normalizeModelResponse(raw, jobDescription) {
    const source = raw && typeof raw === 'object' ? raw : {};

    const technicalQuestions = Array.isArray(source.technicalQuestions)
        ? source.technicalQuestions.map(normalizeQuestion).filter((q) => q.question)
        : [];

    const behavioralQuestions = Array.isArray(source.behavioralQuestions)
        ? source.behavioralQuestions.map(normalizeQuestion).filter((q) => q.question)
        : [];

    const skillGaps = Array.isArray(source.skillGaps)
        ? source.skillGaps.map(normalizeSkillGap).filter((gap) => gap.skill)
        : [];

    const preparationPlan = Array.isArray(source.preparationPlan)
        ? source.preparationPlan.map(normalizePreparationDay).filter((day) => day.focus)
        : [];

    const title = String(source.title || 'Interview Preparation Report').trim();
    const matchScoreRaw = Number(source.matchScore);
    const matchScore = Number.isFinite(matchScoreRaw)
        ? Math.max(0, Math.min(100, Math.round(matchScoreRaw)))
        : 60;

    return {
        matchScore,
        technicalQuestions,
        behavioralQuestions,
        skillGaps,
        preparationPlan,
        title: title || 'Interview Preparation Report',
        _jobDescription: jobDescription,
    };
}


const interviewReportSchema = z.object({

    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description, with 100 being a perfect match."),


    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that may be asked in the interview."),
        intention: z.string().describe("The intention of the interviewer behind asking this question."),
        answer: z.string().describe("How to answer the question effectively, including key points to cover and common pitfalls to avoid.")
    })).min(1).describe("A list of technical questions that may be asked in the interview, along with the intention behind each question and tips on how to answer them effectively."),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that may be asked in the interview."),
        intention: z.string().describe("The intention of the interviewer behind asking this question."),
        answer: z.string().describe("How to answer the question effectively, including key points to cover and common pitfalls to avoid.")
    })).min(1).describe("A list of behavioral questions that may be asked in the interview, along with the intention behind each question and tips on how to answer them effectively."),


    skillGaps: z.array(z.object({
        skill: z.string().describe("The specific skill that the candidate may be lacking based on their resume and self-description."),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap, indicating how critical it is for the candidate to address this gap before the interview."),
    })).min(1).describe("A list of potential skill gaps that the candidate may have based on their resume and self-description, along with an assessment of the severity of each gap."),

    preparationPlan: z.array(z.object({
        day: z.number().int().positive().describe("The day number in the preparation plan, starting from day 1."),
        focus: z.string().describe("The specific focus area for that day, such as a particular technical topic, behavioral question type, or skill to improve."),
        tasks: z.array(z.string()).describe("A list of specific tasks or activities that the candidate should complete on that day to prepare for the interview, such as studying a particular topic, practicing coding problems, or conducting mock interviews.")
    })).min(1).describe("A detailed preparation plan for the candidate, outlining specific focus areas and tasks for each day leading up to the interview."),
    title:z.string().describe("The title of the job for which the interview report is generated."),


});




async function generateInterviewReport({resume, selfDescription, jobDescription}) {



    const prompt = `Based on the following information about a candidate and a job description, generate a comprehensive interview report that includes a match score, potential technical and behavioral questions, identified skill gaps, and a detailed preparation plan for the candidate.

Resume: ${resume}
Self-Description: ${selfDescription}
Job Description: ${jobDescription}

Return valid JSON only.
IMPORTANT OUTPUT FORMAT:
- technicalQuestions: array of objects with keys: question, intention, answer
- behavioralQuestions: array of objects with keys: question, intention, answer
- skillGaps: array of objects with keys: skill, severity (low|medium|high)
- preparationPlan: array of objects with keys: day (number), focus, tasks (string[])
- title: required string
Do not return arrays of strings.`;

/**
 * AI model implementation to generate interview report based on the provided prompt and schema.
 * from this we able to change the model and the response structure 
 */


    const response = await ai.models.generateContent({
        model: process.env.GOOGLE_GENAI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        },
    });

    const raw = JSON.parse(response.text);
    const normalized = normalizeModelResponse(raw, jobDescription);
    const parsed = finalInterviewReportSchema.parse(normalized);

    return {
        ...parsed,
        title: parsed.title?.trim(),
        technicalQuestions: parsed.technicalQuestions.map((q) => ({
            question: q.question.trim(),
            intention: q.intention.trim(),
            answer: q.answer.trim(),
        })),
        behavioralQuestions: parsed.behavioralQuestions.map((q) => ({
            question: q.question.trim(),
            intention: q.intention.trim(),
            answer: q.answer.trim(),
        })),
        skillGaps: parsed.skillGaps.map((gap) => ({
            skill: gap.skill.trim(),
            severity: gap.severity,
        })),
        preparationPlan: parsed.preparationPlan.map((day) => ({
            day: day.day,
            focus: day.focus.trim(),
            tasks: day.tasks.map((task) => task.trim()).filter(Boolean),
        })),
    };
}



module.exports =  generateInterviewReport 