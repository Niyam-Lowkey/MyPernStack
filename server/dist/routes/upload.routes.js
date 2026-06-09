"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middlewares/upload.middleware"));
const router = (0, express_1.Router)();
// Only authenticated admins can upload images
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), upload_middleware_1.default.single('image'), upload_controller_1.uploadImage);
exports.default = router;
