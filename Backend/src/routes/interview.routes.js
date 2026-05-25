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

module.exports = interviewRoutes;