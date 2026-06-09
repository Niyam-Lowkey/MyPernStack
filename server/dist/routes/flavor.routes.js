"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flavor_controller_1 = require("../controllers/flavor.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const flavor_validator_1 = require("../validators/flavor.validator");
const router = (0, express_1.Router)();
// Public routes
router.get('/', flavor_controller_1.getFlavors);
// Admin-only routes
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(flavor_validator_1.createFlavorSchema), flavor_controller_1.createFlavor);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), (0, validate_middleware_1.default)(flavor_validator_1.updateFlavorSchema), flavor_controller_1.updateFlavor);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), flavor_controller_1.deleteFlavor);
exports.default = router;
