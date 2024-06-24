const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const userController = {};

userController.createUser = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("이미 가입된 유저입니다.");
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, name, password: hash, role });
        await newUser.save();

        res.status(201).json({ status: "success", user: newUser });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

userController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select(
            "-createdAt -updatedAt -__v"
        );
        if (!user) {
            throw new Error("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ status: "success", user, token });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = userController;
