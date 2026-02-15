const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendError } = require("../utils/errorResponse");

const userController = {};

userController.createUser = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 400, "이미 가입된 유저입니다.");
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, name, password: hash, role });
        await newUser.save();
        const userObj = newUser.toJSON ? newUser.toJSON() : newUser;
        res.status(201).json({ status: "success", user: userObj });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};
userController.getUser = async (req, res) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (!user) return sendError(res, 401, "Invalid token");
        const userObj = user.toJSON ? user.toJSON() : user;
        return res.status(200).json({ user: userObj });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

module.exports = userController;
