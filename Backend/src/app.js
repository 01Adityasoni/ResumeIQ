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




// use routes
app.use('/api/auth', authRouter);



module.exports = app;