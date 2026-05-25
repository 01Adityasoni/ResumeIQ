const pdfParse = require('pdf-parse');
const generateInterviewReport = require('../services/ai.service');
const interviewReportModel = require('../models/interviewReport.model');

async function generateInterviewReportController(req, res) {
    try {
        const resumeFile = req.file;
        const { selfDescription, jobDescription } = req.body;

        if (!resumeFile) {
            return res.status(400).json({
                message: 'Resume file is required',
            });
        }

        const resumeContent = await pdfParse(resumeFile.buffer);
        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent?.text || '',
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeContent?.text || '',
            selfDescription,
            jobDescription,
            ...interviewReportByAi,
        });

        return res.status(201).json({
            message: 'Interview report generated successfully',
            interviewReport,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to generate interview report',
            error: error.message,
        });
    }
}

module.exports = { generateInterviewReportController };