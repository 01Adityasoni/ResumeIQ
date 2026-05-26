const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const interviewRoutes = express.Router();
const interviewController = require('../controllers/interview.controller');
const upload = require('../middleware/file.middleware');




/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description , resume pdf and job description
 * @access Private
 */

interviewRoutes.post('/', authMiddleware.authUser, upload.single('resume'), interviewController.generateInterviewReportController);



/**
 * @route Get/api/interview/:interviewId
 * @description get interview report by id
 * @access Private
 */

interviewRoutes.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview
 * @description get all interview reports of the user logged in
 * @access Private
 */

interviewRoutes.get('/', authMiddleware.authUser, interviewController.getAllInterviewReportsController) 


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf from the details provided by user resume , job description and self description
 * @access Private
 */
interviewRoutes.get('/resume/pdf/:interviewId', authMiddleware.authUser, interviewController.generateResumePdfController)




module.exports = interviewRoutes;