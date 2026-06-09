"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFlavor = exports.updateFlavor = exports.createFlavor = exports.getFlavors = void 0;
const db_1 = require("../config/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
exports.getFlavors = (0, catchAsync_1.default)(async (req, res, next) => {
    const { product_id, status } = req.query;
    const queryParams = [];
    const whereClauses = [];
    if (product_id) {
        queryParams.push(product_id);
        whereClauses.push(`product_id = $${queryParams.length}`);
    }
    if (status) {
        queryParams.push(status);
        whereClauses.push(`status = $${queryParams.length}`);
    }
    else if (req.query.admin !== 'true') {
        whereClauses.push("status = 'active'");
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM flavors ${whereSql} ORDER BY flavor_name ASC`;
    const flavorsResult = await (0, db_1.query)(sql, queryParams);
    return res.status(200).json({
        status: 'success',
        results: flavorsResult.rowCount,
        data: {
            flavors: flavorsResult.rows,
        },
    });
});
exports.createFlavor = (0, catchAsync_1.default)(async (req, res, next) => {
    const { product_id, flavor_name, status } = req.body;
    // Check product exists
    const prodCheck = await (0, db_1.query)('SELECT id FROM products WHERE id = $1', [product_id]);
    if (prodCheck.rowCount === 0) {
        return next(new AppError_1.default('Associated product not found', 404));
    }
    const result = await (0, db_1.query)(`INSERT INTO flavors (product_id, flavor_name, status)
     VALUES ($1, $2, $3)
     RETURNING *`, [product_id, flavor_name, status || 'active']);
    return res.status(201).json({
        status: 'success',
        data: {
            flavor: result.rows[0],
        },
    });
});
exports.updateFlavor = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { flavor_name, status } = req.body;
    // Check flavor exists
    const checkRes = await (0, db_1.query)('SELECT * FROM flavors WHERE id = $1', [id]);
    const flavor = checkRes.rows[0];
    if (!flavor) {
        return next(new AppError_1.default('Flavor not found', 404));
    }
    const updatedName = flavor_name !== undefined ? flavor_name : flavor.flavor_name;
    const updatedStatus = status !== undefined ? status : flavor.status;
    const result = await (0, db_1.query)(`UPDATE flavors
     SET flavor_name = $1, status = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`, [updatedName, updatedStatus, id]);
    return res.status(200).json({
        status: 'success',
        data: {
            flavor: result.rows[0],
        },
    });
});
exports.deleteFlavor = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deleteRes = await (0, db_1.query)('DELETE FROM flavors WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
        return next(new AppError_1.default('Flavor not found', 404));
    }
    return res.status(204).json({
        status: 'success',
        data: null,
    });
});
