const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        brand: { type: String, required: true },
        bigCategory: { type: String, required: true },
        image: { type: String, required: true },
        category: {
            main: { type: String, required: true },
            sub: { type: String, required: true },
        },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Map, of: Number, required: true },
        color: { type: String },
        status: { type: String, default: "active" },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

productSchema.pre("save", function (next) {
    const product = this;
    const validClothingSizes = ["XS", "S", "M", "L", "XL"];
    const validShoeSizes = [
        "220",
        "230",
        "240",
        "250",
        "260",
        "270",
        "280",
        "290",
    ];
    const validFreeSizes = ["free"];

    if (product.category.main === "의류") {
        if (!validClothingSizes.every((size) => size in product.stock)) {
            return next(
                new Error(
                    "Stock sizes must include XS,S, M, L and XL for 의류 category."
                )
            );
        } else {
            return next(new Error("Invalid subcategory for 의류."));
        }
    } else if (product.category.main === "신발") {
        for (let size of Object.keys(product.stock)) {
            if (!validShoeSizes.includes(size)) {
                return next(
                    new Error(`Invalid shoe size ${size} for 신발 category.`)
                );
            }
        }
    } else if (
        product.category.main === "가방" ||
        product.category.main === "액세서리"
    ) {
        if (!validFreeSizes.every((size) => size in product.stock)) {
            return next(
                new Error(
                    "Stock sizes must include free for 가방 or 액세서리 category."
                )
            );
        }
    } else if (
        ["INTERIOR", "KITCHEN", "ELECTRONICS", "DIGITAL", "BEAUTY"].includes(
            product.category.main
        )
    ) {
    } else {
        return next(new Error("Invalid main category."));
    }

    next();
});

productSchema.methods.toJSON = function () {
    const obj = this._doc;

    delete obj.__v;
    delete obj.updatedAt;
    delete obj.createdAt;
    return obj;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
