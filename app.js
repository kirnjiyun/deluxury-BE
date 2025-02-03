const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/indexRouter");
const app = express();
require("dotenv").config();

const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
console.log("mongo", MONGODB_URI_PROD);
const mongoURI = MONGODB_URI_PROD;

app.use(
    cors({
        origin: "*", // 모든 도메인 허용
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 모든 메서드 허용
        allowedHeaders: ["Content-Type", "Authorization"], // 필요한 헤더 허용
    })
);
app.options("*", cors()); // 모든 경로의 OPTIONS 요청 허용

app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use("/api", indexRouter);

// 여기 추가된 부분
app.get("/", (req, res) => {
    res.send("연결 성공입니다!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        error: err.message,
    });
});

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB 연결 성공!");
    } catch (error) {
        console.error("MongoDB 연결 실패:", error);
    }
}

connectToDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
