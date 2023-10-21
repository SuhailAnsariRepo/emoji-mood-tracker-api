const User = require('../models/user');
const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_SECRET || "secret";

const ErrorHandler = (req, res, next, error) => {
    const errorObject = {
        api: req.originalUrl,
        message: error.message,
        stack: error.stack,
    };
    console.log(errorObject);
    res.status(500).json(errorObject);
    return next();
};

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            return res.status(401).json('Access token is required.');
        }

        try {
            let jwtPayload = await jwt.verify(token, accessTokenSecret);
            if (!jwtPayload || !jwtPayload.username) {
                throw Error;
            }
            let user = await User.findOne({ username: jwtPayload.username });
            if (!user) {
                return res.status(403).json('Invalid access token, user not found.');
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(403).json('Invalid access token.');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    ErrorHandler,
    authenticate
};