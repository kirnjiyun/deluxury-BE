const orderController = {};
const Order = require("../models/Order");
const { generateRandomString } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const { sendError } = require("../utils/errorResponse");
const PAGE_SIZE = 3;

orderController.createOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { shipTo, contact, orderList } = req.body;
        // 재고 확인 및 업데이트
        const insufficientStockItems =
            await productController.checkItemListStock(orderList);
        // 재고 부족하면 에러 발생
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce(
                (total, item) => `${total}${item.message}\n`,
                ""
            );
            throw new Error(errorMessage);
        }
        // 주문 생성
        const newOrder = new Order({
            userId,
            shipTo,
            contact,
            items: orderList,
            orderNum: generateRandomString(10), // 올바른 함수 호출
        });
        await newOrder.save();
        //카트 비우기

        res.status(200).json({ orderNum: newOrder.orderNum });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

orderController.getOrder = async (req, res, next) => {
    try {
        const { userId } = req;
        const { page = 1 } = req.query;

        const orderList = await Order.find({ userId: userId })
            .populate({
                path: "items.productId",
                model: "Product",
                select: "image name",
            })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);

        const totalItemNum = await Order.countDocuments({ userId: userId });
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

        res.status(200).json({
            data: orderList,
            totalPageNum,
        });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

orderController.getOrderList = async (req, res, next) => {
    try {
        const { page = 1, ordernum } = req.query;

        let cond = {};
        if (ordernum) {
            cond = {
                orderNum: { $regex: ordernum, $options: "i" },
            };
        }

        const orderList = await Order.find(cond)
            .populate("userId")
            .populate({
                path: "items.productId",
                model: "Product",
                select: "image name",
            })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);

        const totalItemNum = await Order.countDocuments(cond);
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

        res.status(200).json({
            data: orderList,
            totalPageNum,
        });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

orderController.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );
        if (!order) return sendError(res, 404, "Can't find order");

        res.status(200).json({ data: order });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

orderController.getOrderById = async (req, res, next) => {
    try {
        const { orderNum } = req.params;
        const order = await Order.findOne({ orderNum }).populate({
            path: "items.productId",
            model: "Product",
            select: "image name",
        });

        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        res.status(200).json({ data: order });
    } catch (error) {
        return sendError(res, 400, error.message);
    }
};

module.exports = orderController;
