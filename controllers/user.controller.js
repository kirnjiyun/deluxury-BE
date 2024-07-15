const bcrypt = require("bcrypt");
const User = require("../models/User");

const userController = {};

userController.createUser = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("이미 가입된 유저입니다.");
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, name, password: hash, role });
        await newUser.save();

        res.status(201).json({ status: "success", user: newUser });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
userController.getUser = async (req, res) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (user) {
            return res.status(200).json({ status: "success", user });
        }
        throw new Error("Invalid token");
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = userController;
