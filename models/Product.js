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
        stock: { type: Object, required: true },
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

    const stockSizes = Object.keys(product.stock);

    if (product.category.main === "clothes") {
        const isValid = stockSizes.every((size) =>
            validClothingSizes.includes(size)
        );
        if (!isValid) {
            return next(
                new Error(
                    "Stock sizes need at least one of the valid clothing sizes for 의류 category."
                )
            );
        }
    } else if (product.category.main === "shoes") {
        const isValid = stockSizes.every((size) =>
            validShoeSizes.includes(size)
        );
        if (!isValid) {
            return next(
                new Error(
                    "Stock sizes need at least one of the valid shoe sizes for 신발 category."
                )
            );
        }
    } else if (
        product.category.main === "bags" ||
        product.category.main === "accessories"
    ) {
        // No specific validation for 가방 or 액세서리 categories
    } else if (
        ["INTERIOR", "KITCHEN", "ELECTRONICS", "DIGITAL", "BEAUTY"].includes(
            product.category.main
        )
    ) {
        // Do nothing specific for these categories
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
