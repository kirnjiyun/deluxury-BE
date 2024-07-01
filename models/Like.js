const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Product = require("./Product");
const likeSchema = Schema(
    {
        userId: { type: mongoose.ObjectId, ref: User },
        items: [
            {
                productId: { type: mongoose.ObjectId, ref: Product },
            },
        ],
    },
    { timestamps: true }
);
likeSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__V;
    delete obj.updateAt;
    delete obj.createAt;
    return obj;
};
const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
