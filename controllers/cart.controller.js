const mongoose = require("mongoose");
const cartController = {};
const Cart = require("../models/Cart");

cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, qty } = req.body;

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

        let cart = await Cart.findOne({ userId: userId }).populate(
            "items.productId"
        );
        if (!cart) {
            cart = new Cart({ userId });
            await cart.save();
        }

        console.log("Cart found or created:", cart);

        const existItem = cart.items.find(
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
        cart.items.push(newItem);
        await cart.save();
        const populatedCart = await Cart.findOne({ userId: userId }).populate(
            "items.productId"
        );
        const addedItem = populatedCart.items.find(
            (item) =>
                item.productId._id.toString() === productId &&
                item.size === size
        );
        res.status(200).json({
            status: "success",
            item: addedItem, // 여기서 반환하는 데이터 구조 확인
            cartItemQty: cart.items.length,
        });
    } catch (error) {
        console.error("Error occurred while adding item to cart:", error); // 오류 메시지 로깅 추가
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = cartController;

cartController.getCart = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!cart) {
            return res.status(200).json({ status: "success", data: [] });
        }

        res.status(200).json({ status: "success", data: cart.items });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

cartController.deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter((item) => !item._id.equals(id));

        await cart.save();
        res.status(200).json({ status: 200, cartItemQty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

cartController.editCartItem = async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;

        const { qty } = req.body;
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!cart) throw new Error("There is no cart for this user");
        const index = cart.items.findIndex((item) => item._id.equals(id));
        if (index === -1) throw new Error("Can not find item");
        cart.items[index].qty = qty;
        await cart.save();
        res.status(200).json({ status: 200, data: cart.items });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

cartController.getCartQty = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId: userId });
        if (!cart) throw new Error("There is no cart!");
        res.status(200).json({ status: 200, qty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = cartController;
