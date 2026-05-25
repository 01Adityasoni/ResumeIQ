require('dotenv').config();

const app = require('./src/app');
const generateInterviewReport = require('./src/services/ai.service');
const { resume, selfDescription, jobDescription } = require('./src/services/temp');
const PORT = process.env.PORT || 3000;

const connectToDB = require('./src/config/database');
connectToDB();

//generateInterviewReport({ resume, selfDescription, jobDescription }).catch((error) => {
  //console.error('Failed to generate interview report:', error);
//});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});