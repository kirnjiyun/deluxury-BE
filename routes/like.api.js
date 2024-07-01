const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const likeController = require("../controllers/like.controller");
router.post("/", authController.authenticate, likeController.addToLike);
router.get("/", authController.authenticate, likeController.getLike);
router.delete(
    "/:id",
    authController.authenticate,
    likeController.deleteLikeItem
);

module.exports = router;
