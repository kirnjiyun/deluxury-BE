const userController = {};
const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret_key";

userController.createUser = async (req, res) => {
    try {
        // req.body에서 정보 가져오기
        const { email, name, password, role } = req.body;

        // 이미 가입된 유저인지 확인
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error("이미 가입이 된 유저입니다.");
        }

        // 비밀번호 해싱
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        console.log("hash", hash);

        // 새로운 유저 생성
        const newUser = new User({ email, name, password: hash, role });
        await newUser.save();

        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

userController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 이메일로 유저 찾기, createdAt, updatedAt, __v 필드 제외
        const user = await User.findOne(
            { email: email },
            "-createdAt -updatedAt -__v"
        );
        if (!user) {
            throw new Error("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        // 비밀번호 비교
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            throw new Error("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        // JWT 토큰 발행
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ status: "success", user, token });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = userController;
