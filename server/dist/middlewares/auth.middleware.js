"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = __importDefault(require("../utils/AppError"));
const protect = async (req, res, next) => {
    try {
        let token = '';
        // Check Authorization Header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError_1.default('You are not logged in. Please log in to gain access.', 401));
        }
        // Verify token
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        // Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new AppError_1.default('Invalid token or authorization signature expired.', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.default('You do not have permission to perform this action.', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
