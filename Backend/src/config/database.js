const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDB() {
    try {

        console.log("Mongo URI exists:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB');

    } catch (error) {
        console.error('Error connecting to MongoDB:');
        console.error(error);
    }
}

module.exports = connectToDB;