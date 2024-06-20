const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();
router.post("/", userController.createUser);
//reqbody 쓰려면 get 을 못 써 url 이용한다면 get 쓸 수 있는데 개인정보를 넣을 수 없으니까!
router.post("/login", userController.loginWithEmail);

module.exports = router;
