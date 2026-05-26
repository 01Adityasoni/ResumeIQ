const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule?.PDFParse || pdfParseModule?.default?.PDFParse;
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

        if (typeof PDFParse !== 'function') {
            throw new Error('PDF parser failed to initialize');
        }

        const parser = new PDFParse({ data: resumeFile.buffer });
        let resumeContent;
        try {
            resumeContent = await parser.getText();
        } finally {
            await parser.destroy();
        }
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

/**
 * @description controller to get a specific interview report by ID
 * @route GET /api/interview/:interviewId
 * @access Private
 */


async function getInterviewReportByIdController(req, res) {

    const {interviewId} = req.params

    const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user._id})

    if(!interviewReport) {
        return res.status(404).json({
            message: 'Interview report not found'
        })
    }

    return res.status(200).json({
        message: 'Interview report fetched successfully',
        interviewReport
    })
}


/**
 * @description controller to get all interview reports of the user logged in
 * @route GET /api/interview
 * @access Private
 */


async function getAllInterviewReportsController(req, res) {

    const interviewReports = await interviewReportModel.find({user: req.user._id}).sort({createdAt: -1})

    return res.status(200).json({
        message: 'Interview reports fetched successfully',
        interviewReports
    })
}

module.exports = { generateInterviewReportController , getInterviewReportByIdController, getAllInterviewReportsController };