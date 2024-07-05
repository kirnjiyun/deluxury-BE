const orderController = {};
const Order = require("../models/Order");
const { generateRandomString } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
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

        res.status(200).json({
            status: "success",
            orderNum: newOrder.orderNum,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

orderController.getOrder = async (req, res, next) => {
    try {
        const { userId } = req;

        const orderList = await Order.find({ userId: userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
                select: "image name",
            },
        });
        const totalItemNum = await Order.find({ userId: userId }).count();

        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({
            status: "success",
            data: orderList,
            totalPageNum,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
orderController.getOrderList = async (req, res, next) => {
    try {
        const { page, ordernum } = req.query;

        let cond = {};
        if (ordernum) {
            cond = {
                orderNum: { $regex: ordernum, $options: "i" },
            };
        }

        const orderList = await Order.find(cond)
            .populate("userId")
            .populate({
                path: "items",
                populate: {
                    path: "productId",
                    model: "Product",
                    select: "image name",
                },
            })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);
        const totalItemNum = await Order.find(cond).count();

        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({
            status: "success",
            data: orderList,
            totalPageNum,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
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
        if (!order) throw new Error("Can't find order");

        res.status(200).json({ status: "success", data: order });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
orderController.getOrderById = async (req, res, next) => {
    try {
        const { orderNum } = req.params;
        const order = await Order.findOne({ orderNum }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
                select: "image name",
            },
        });

        if (!order) {
            return res
                .status(404)
                .json({ status: "fail", message: "Order not found" });
        }

        res.status(200).json({
            status: "success",
            data: order,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
module.exports = orderController;
