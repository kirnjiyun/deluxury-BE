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
            like = new like({ userId });
            await like.save();
        }

        console.log("like found or created:", like);

        const existItem = like.items.find(
            (item) =>
                item.productId._id.toString() === productId &&
                item.size === size
        );

        if (existItem) {
            return res.status(400).json({
                status: "fail",
                error: "아이템이 이미 카트에 존재합니다.",
            });
        }

        const newItem = {
            productId: new mongoose.Types.ObjectId(productId),
            size,
            qty,
        };
        like.items.push(newItem);
        await like.save();
        const populatedlike = await like
            .findOne({ userId: userId })
            .populate("items.productId");
        const addedItem = populatedlike.items.find(
            (item) => item.productId._id.toString() === productId
        );
        res.status(200).json({
            status: "success",
            item: addedItem,
        });
    } catch (error) {
        console.error("Error occurred while adding item to like:", error);
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

likeController.getlike = async (req, res) => {
    try {
        const { userId } = req;
        const like = await like.findOne({ userId }).populate({
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

likeController.deletelikeItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const like = await like.findOne({ userId });
        like.items = like.items.filter((item) => !item._id.equals(id));

        await like.save();
        res.status(200).json({ status: 200, likeItemQty: like.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = likeController;
