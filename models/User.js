const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

// JWT 토큰 생성 메서드 (일반 함수 사용)
userSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id, role: this.role }, JWT_SECRET_KEY, {
        expiresIn: "1h", // 만료 시간 1시간
    });
    return token;
};

// toJSON 메서드 (일반 함수 사용, 비밀번호 필드 제거)
userSchema.methods.toJSON = function () {
    const obj = this.toObject(); // Mongoose 문서를 일반 객체로 변환
    delete obj.password; // 비밀번호 필드 제거
    return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
