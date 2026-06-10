const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');  

async function authUser(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }


    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isTokenBlacklisted) {
        return res.status(401).json({ message: "Token is invalid" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const normalizedId = decoded.id || decoded._id;
        req.user = {
            ...decoded,
            id: normalizedId,
            _id: normalizedId,
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = {authUser};