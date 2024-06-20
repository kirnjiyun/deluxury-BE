const userController = {};
const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;
userController.createUser = async (req, res) => {
    try {
        //front에서 보낸 유저 정보 받기
        const { email, name, password, role } = req.body;
        //이미 가입 된 유저인지 이메일로 확인
        const user = await User.findOne({ email: email });
        if (user) {
            throw new Error("이미 가입이 된 유저입니다.");
        }
        //패스워드 암호화하기
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        console.log("hash", hash);
        const newUser = await new User({ email, name, password: hash, role });
        await newUser.save();
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
module.exports = userController;
