const User = require('../models/user');
const { ErrorHandler } = require('../middleware/authenticate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_SECRET || "secret";

const register = async (req, res, next) => {
    try {
        const { email, name, password, username } = req.body;
        if (!email || !name || !password || !username) {
            return res.status(400).json('Missing required field(s). Please provide all required data');
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json('Username or email already exists. Please choose a different one.');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const user = new User({
            name: name,
            email: email,
            username: username,
            password: hash
        });

        let savedUser = await user.save();
        savedUser = savedUser.toObject();
        delete savedUser.password;
        return res.json(savedUser);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const login = async (req, res, next) => {
    try {
        console.log("Suhail");
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json('Missing required field(s). Please provide all required data');
        }

        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json('User not found.');
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json('Worng credentials.');
        }
        user = user.toObject();
        delete user.password;

        let accessToken = jwt.sign(user, accessTokenSecret, { expiresIn: '1d' });
        user.accessToken = accessToken;

        return res.json(user);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};


const toggleSharing = async (req, res, next) => {
    try {
        let user = req.user;
        user.sharingEnabled = !user.sharingEnabled;
        user = await user.save();

        user = user.toObject();
        delete user.password;
        return res.json(user);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

module.exports = {
    register,
    login,
    toggleSharing
};