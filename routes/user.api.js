const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();
//1.회원가입
router.post("/", userController.createUser);
module.exports = router;
