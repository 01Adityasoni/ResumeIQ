const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: [true , "Username already taken"] },
    email: { type: String, required: true, unique: [true , "Email already registered"] },
    password: { type: String, required: true },
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;