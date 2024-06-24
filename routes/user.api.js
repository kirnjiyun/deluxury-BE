const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();
router.post("/", userController.createUser);
//reqbody 쓰려면 get 을 못 써 url 이용한다면 get 쓸 수 있는데 개인정보를 넣을 수 없으니까!
router.post("/", userController.createUser);
//토큰관련
router.get(
    "/me",
    authController.authenticate, //validate한 토큰인지
    userController.getUser //내 토큰 주세요
);
// GET 요청 처리 (예시)
router.get("/", (req, res) => {
    res.send("User endpoint");
});

module.exports = router;
