const mongoose = require("mongoose");
const likeController = {};
const Like = require("../models/Like");

likeController.addToLike = async (req, res) => {
    try {
        const { userId } = req;
        const { productId } = req.body;

        if (!userId) {
            return res
                .status(400)
                .json({ status: "fail", error: "유효하지 않은 사용자입니다." });
        }

        if (!productId) {
            return res.status(400).json({
                status: "fail",
                error: "유효하지 않은 제품 ID입니다.",
            });
        }

        let like = await Like.findOne({ userId: userId }).populate(
            "items.productId"
        );
        if (!like) {
            like = new Like({ userId });
            await like.save();
        }

        const existItem = like.items.find(
            (item) => item.productId._id.toString() === productId
        );

        if (existItem) {
            return res.status(400).json({
                status: "fail",
                error: "아이템을 이미 찜하셨습니다.",
            });
        }

        const newItem = {
            productId: new mongoose.Types.ObjectId(productId),
        };

        like.items.push(newItem);
        await like.save();

        const populatedLike = await Like.findOne({ userId: userId }).populate(
            "items.productId"
        );

        const addedItem = populatedLike.items.find(
            (item) => item.productId._id.toString() === productId
        );

        res.status(200).json({
            status: "success",
            item: addedItem,
        });
    } catch (error) {
        console.error("아이템을 찜하는 동안 에러가 발생했습니다:", error);
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

likeController.getLike = async (req, res) => {
    try {
        const { userId } = req;
        const like = await Like.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!like) {
            return res.status(200).json({ status: "success", data: [] });
        }

        res.status(200).json({ status: "success", data: like.items });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

likeController.deleteLikeItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const like = await Like.findOne({ userId });
        if (!like) {
            return res
                .status(400)
                .json({ status: "fail", error: "찜 목록이 없습니다." });
        }

        like.items = like.items.filter((item) => !item._id.equals(id));

        await like.save();
        res.status(200).json({
            status: "success",
            likeItemQty: like.items.length,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = likeController;
