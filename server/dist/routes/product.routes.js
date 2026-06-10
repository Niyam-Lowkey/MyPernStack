"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
// Authenticated routes (login required for all users)
router.get('/', auth_middleware_1.protect, product_controller_1.getProducts);
router.get('/:idOrSlug', auth_middleware_1.protect, product_controller_1.getProductByIdOrSlug);
// Admin-only routes
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(product_validator_1.createProductSchema), product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(product_validator_1.updateProductSchema), product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), product_controller_1.deleteProduct);
exports.default = router;
