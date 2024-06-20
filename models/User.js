const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const userSchema = Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);
userSchema.methods.generateToken = () => {
    const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY);
    return token;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
