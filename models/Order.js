const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const Cart = require("./Cart");
const orderSchema = Schema(
    {
        userId: { type: mongoose.ObjectId, ref: User },
        status: { type: String, default: "결제완료" },
        shipTo: { type: Object, required: true },
        contact: { type: Object, required: true },
        orderNum: { type: String },
        items: [
            {
                productId: { type: mongoose.ObjectId, ref: Product },
                price: { type: Number, required: true },
                qty: { type: Number, required: true, default: 1 },
                size: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);
orderSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    delete obj.updatedAt;
    return obj;
};
orderSchema.post("save", async function () {
    //카트 비우기
    const cart = await Cart.findOne({ userId: this.userId });
    cart.items = [];
    await cart.save();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
