const mongoose = require("mongoose");
const likeController = {};
const Like = require("../models/Like");
const { sendError } = require("../utils/errorResponse");

likeController.addToLike = async (req, res) => {
    try {
        const { userId } = req;
        const { productId } = req.body;

        if (!userId) {
            return sendError(res, 400, "유효하지 않은 사용자입니다.");
        }

        if (!productId) {
            return sendError(res, 400, "유효하지 않은 제품 ID입니다.");
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
            return sendError(res, 400, "아이템을 이미 찜하셨습니다.");
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

        res.status(200).json({ item: addedItem });
    } catch (error) {
        console.error("아이템을 찜하는 동안 에러가 발생했습니다:", error);
        return sendError(res, 400, error.message);
    }
};

likeController.getLike = async (req, res) => {
    try {
        const { userId } = req;
        const like = await Like.findOne({ userId }).populate({
            path: "items.productId",
            model: "Product",
        });
        if (!like) {
            return res.status(200).json({ data: [] });
        }

        res.status(200).json({ data: like.items });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

likeController.deleteLikeItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const like = await Like.findOne({ userId });
        if (!like) {
            return sendError(res, 400, "찜 목록이 없습니다.");
        }

        like.items = like.items.filter((item) => !item._id.equals(id));

        await like.save();
        res.status(200).json({ data: { likeItemQty: like.items.length } });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

module.exports = likeController;
