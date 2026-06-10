"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Authenticated routes (login required for all users)
router.get('/', auth_middleware_1.protect, banner_controller_1.getBanners);
// Admin-only routes
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), banner_controller_1.createBanner);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), banner_controller_1.updateBanner);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), banner_controller_1.deleteBanner);
exports.default = router;
