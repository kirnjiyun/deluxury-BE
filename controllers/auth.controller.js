const authController = {};
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
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
                    expiresIn: "1h",
                });
                return res.status(200).json({ status: "success", user, token });
            }
        }
        throw new Error("이메일 또는 비밀번호가 틀렸습니다.");
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
// authController.loginWithGoogle = async (req, res) => {
//     try {
//         const { credential } = req.body;
//         const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

//         // ID 토큰을 검증하여 사용자 정보를 얻음
//         const ticket = await googleClient.verifyIdToken({
//             idToken: credential,
//             audience: GOOGLE_CLIENT_ID,
//         });

//         // 사용자 정보 추출
//         const payload = ticket.getPayload();
//         const { email, name } = payload;

//         // 사용자 정보가 유효한지 확인
//         if (!email || !name) {
//             throw new Error("Invalid user information from Google");
//         }

//         // 데이터베이스에서 사용자 조회
//         let user = await User.findOne({ email });
//         if (!user) {
//             const randomPassword = Math.random().toString(36).slice(-8); // 임시 비밀번호 생성
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(randomPassword, salt);

//             // 새로운 사용자 생성 및 저장
//             user = new User({
//                 name,
//                 email,
//                 password: hashedPassword,
//             });
//             await user.save();
//         }

//         // JWT 토큰 생성
//         const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
//             expiresIn: "1h",
//         });

//         // 응답으로 사용자 정보와 토큰 반환
//         res.status(200).json({
//             status: "success",
//             user,
//             token,
//         });
//     } catch (error) {
//         console.error("Error during Google login:", error.message);
//         res.status(400).json({ status: "fail", error: error.message });
//     }
// };

// authController.loginWithKakao = async (req, res) => {
//     try {
//         const { code } = req.body;
//         console.log("Received code from client:", code);

//         const tokenResponse = await axios.post(
//             "https://kauth.kakao.com/oauth/token",
//             null,
//             {
//                 params: {
//                     grant_type: "authorization_code",
//                     client_id: KAKAO_CLIENT_ID,
//                     redirect_uri: KAKAO_REDIRECT_URI,
//                     code,
//                 },
//             }
//         );
//         console.log("Token response from Kakao:", tokenResponse.data);

//         if (!tokenResponse.data || !tokenResponse.data.access_token) {
//             throw new Error("Failed to get access token from Kakao");
//         }

//         const accessToken = tokenResponse.data.access_token;

//         const kakaoResponse = await axios.get(
//             "https://kapi.kakao.com/v2/user/me",
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//         );
//         console.log("User info from Kakao:", kakaoResponse.data);

//         if (!kakaoResponse.data || !kakaoResponse.data.kakao_account) {
//             throw new Error("Failed to get user info from Kakao");
//         }

//         const { id, properties, kakao_account } = kakaoResponse.data;
//         if (!kakao_account.email) {
//             throw new Error(
//                 "Email is not provided. Please ensure that email scope is included."
//             );
//         }

//         let user = await User.findOne({ email: kakao_account.email });
//         if (!user) {
//             const randomPassword = "" + Math.floor(Math.random() * 100000000);
//             const salt = await bcrypt.genSalt(10);
//             const newPassword = await bcrypt.hash(randomPassword, salt);
//             user = new User({
//                 name: properties.nickname,
//                 email: kakao_account.email,
//                 password: newPassword,
//             });
//             await user.save();
//         }
//         const sessionToken = jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
//             expiresIn: "1h",
//         });
//         res.status(200).json({
//             status: "success",
//             user,
//             token: sessionToken,
//         });
//     } catch (error) {
//         console.error("Error during Kakao login:", error.message);
//         res.status(400).json({ status: "fail", error: error.message });
//     }
// };

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

authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (user.level !== "admin") throw new Error("no permission");
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = authController;
