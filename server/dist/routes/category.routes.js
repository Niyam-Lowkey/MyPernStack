"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const category_validator_1 = require("../validators/category.validator");
const router = (0, express_1.Router)();
// Authenticated routes (login required for all users)
router.get('/', auth_middleware_1.protect, category_controller_1.getCategories);
router.get('/:idOrSlug', auth_middleware_1.protect, category_controller_1.getCategoryByIdOrSlug);
// Admin-only routes
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(category_validator_1.createCategorySchema), category_controller_1.createCategory);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(category_validator_1.updateCategorySchema), category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), category_controller_1.deleteCategory);
exports.default = router;
