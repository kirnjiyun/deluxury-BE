const mongoose = require("mongoose");
const cartController = {};
const Cart = require("../models/Cart");
const { sendError } = require("../utils/errorResponse");

cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, quantity } = req.body;
        const qty = req.body.qty ?? quantity ?? 1;

        if (!userId) {
            return sendError(res, 400, "유효하지 않은 사용자입니다.");
        }
        if (!productId) {
            return sendError(res, 400, "유효하지 않은 제품 ID입니다.");
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
            return sendError(res, 400, "아이템이 이미 카트에 존재합니다.");
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
            item: addedItem,
            cartItemQty: cart.items.length,
        });
    } catch (error) {
        console.error("Error occurred while adding item to cart:", error);
        return sendError(res, 400, error.message);
    }
};

cartController.getCart = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            model: "Product",
        });
        if (!cart) {
            return res.status(200).json({ data: [] });
        }
        const items = cart.items.map((item) => {
            const i = item.toObject ? item.toObject() : { ...item };
            if (i.productId && i.productId.stock && typeof i.productId.stock === "object") {
                i.productId = {
                    ...i.productId,
                    stock: i.productId.stock[i.size] != null ? i.productId.stock[i.size] : 0,
                };
            }
            return i;
        });
        res.status(200).json({ data: items });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

cartController.deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter((item) => !item._id.equals(id));

        await cart.save();
        res.status(200).json({ data: { cartItemQty: cart.items.length } });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

cartController.editCartItem = async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { qty } = req.body;

        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            model: "Product",
        });
        if (!cart) return sendError(res, 404, "There is no cart for this user");

        const index = cart.items.findIndex((item) => item._id.equals(id));
        if (index === -1) return sendError(res, 404, "Cannot find item");

        const item = cart.items[index];
        if (item.productId.stock[item.size] < qty) {
            return sendError(res, 400, "재고가 부족합니다.");
        }

        item.qty = qty;
        await cart.save();

        res.status(200).json({ data: cart.items });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

cartController.getCartQty = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId: userId });
        if (!cart) return sendError(res, 404, "There is no cart!");
        res.status(200).json({ qty: cart.items.length });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

module.exports = cartController;
