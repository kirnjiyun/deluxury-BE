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
        origin: function (origin, callback) {
            const allowedOrigins = [
                "http://localhost:3000",
                "https://deluxury-jiyun.netlify.app",
                "https://main--deluxury-jiyun.netlify.app",
            ];

            // 로컬 서버나 Postman 같은 경우 origin이 undefined일 수 있음
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS 정책에 의해 차단된 요청입니다."));
            }
        },
        credentials: true,
    })
);

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
