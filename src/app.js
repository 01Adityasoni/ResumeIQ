const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());    

app.use(express.json());



// require routes
const authRouter = require('./routes/auth.routes');




// use routes
app.use('/api/auth', authRouter);



module.exports = app;