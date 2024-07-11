const authController = {};
// const { OAuth2Client } = require("google-auth-library");
// const axios = require("axios");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
// const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

authController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
                    expiresIn: "10h",
                });
                return res.status(200).json({ status: "success", user, token });
            }
        }
        throw new Error("이메일 또는 비밀번호가 틀렸습니다.");
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (user.role !== "admin") throw new Error("No permission");
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) throw new Error("Token not found");

        const token = tokenString.replace("Bearer ", "");
        const payload = await promisify(jwt.verify)(token, JWT_SECRET_KEY);
        req.userId = payload.id;
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = authController;
