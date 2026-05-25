const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(cookieParser());    

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));


// require routes
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');



// use routes
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);



module.exports = app;