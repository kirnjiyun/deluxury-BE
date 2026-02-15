const authController = {};
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { sendError } = require("../utils/errorResponse");
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
                const userObj = user.toJSON ? user.toJSON() : user;
                return res.status(200).json({ status: "success", token, user: userObj });
            }
        }
        return sendError(res, 401, "이메일 또는 비밀번호가 틀렸습니다.");
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};
authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (!user || user.role !== "admin") return sendError(res, 403, "권한이 없습니다.");
        next();
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) return sendError(res, 401, "Token not found");

        const token = tokenString.replace("Bearer ", "");
        const payload = await promisify(jwt.verify)(token, JWT_SECRET_KEY);
        req.userId = payload.id;
        next();
    } catch (error) {
        return sendError(res, 401, error.message);
    }
};

module.exports = authController;
