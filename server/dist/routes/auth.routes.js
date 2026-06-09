"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_1.default)(auth_validator_1.loginSchema), auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
router.post('/logout', auth_controller_1.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
