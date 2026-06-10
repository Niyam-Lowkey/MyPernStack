"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const jwt_1 = require("../utils/jwt");
exports.register = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, email, password } = req.body;
    // 1. Check if user already exists
    const existingUser = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
        return next(new AppError_1.default('An account with this email already exists', 409));
    }
    // 2. Hash password
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    // 3. Create user with 'customer' role
    const newUser = await (0, db_1.query)(`INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`, [name.trim(), email.toLowerCase().trim(), passwordHash, 'customer', true]);
    const user = newUser.rows[0];
    // 4. Generate tokens
    const accessToken = (0, jwt_1.generateAccessToken)(user);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user);
    // 5. Set Refresh Token in Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // 6. Send response
    return res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
        },
    });
});
exports.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const { email, password, rememberMe } = req.body;
    // 1. Fetch user from DB
    const userResult = await (0, db_1.query)('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = userResult.rows[0];
    if (!user || !user.is_active) {
        return next(new AppError_1.default('Invalid email or password', 401));
    }
    // 2. Verify password
    const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        return next(new AppError_1.default('Invalid email or password', 401));
    }
    // 3. Generate tokens
    const accessToken = (0, jwt_1.generateAccessToken)(user);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user);
    // 4. Set Refresh Token in Cookie
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days if remember me
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    // 5. Send response
    return res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
        },
    });
});
exports.refresh = (0, catchAsync_1.default)(async (req, res, next) => {
    let refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        return next(new AppError_1.default('No refresh token provided', 401));
    }
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Fetch user to confirm they still exist/are active
        const userResult = await (0, db_1.query)('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
        const user = userResult.rows[0];
        if (!user || !user.is_active) {
            return next(new AppError_1.default('User is no longer active or does not exist', 401));
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(user);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
        // Update refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            status: 'success',
            data: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (error) {
        return next(new AppError_1.default('Expired or invalid refresh token', 401));
    }
});
exports.logout = (0, catchAsync_1.default)(async (req, res, next) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    return res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});
exports.getMe = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError_1.default('Not authenticated', 401));
    }
    const userResult = await (0, db_1.query)('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    if (!user) {
        return next(new AppError_1.default('User not found', 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
