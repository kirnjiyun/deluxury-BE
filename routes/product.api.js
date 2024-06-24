const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const Product = require("../models/Product");
const router = express.Router();

router.post(
    "/",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
);
router.post("/bulk", async (req, res) => {
    try {
        const products = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({
                status: "error",
                error: "Expected an array of products",
            });
        }
        const result = await Product.insertMany(products);
        res.status(201).json({ status: "success", data: result });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.get("/", productController.getProduct);
router.get("/all", productController.getProductAll);
router.get("/:id", productController.getProductById);
router.put(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);
router.delete(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.deleteProduct
);
module.exports = router;
