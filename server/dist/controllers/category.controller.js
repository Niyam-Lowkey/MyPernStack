"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryByIdOrSlug = exports.getCategories = void 0;
const db_1 = require("../config/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const slugify_1 = __importDefault(require("../utils/slugify"));
exports.getCategories = (0, catchAsync_1.default)(async (req, res, next) => {
    // If request indicates admin mode, return all categories. Otherwise return active only.
    const isAdminView = req.query.admin === 'true';
    const sql = isAdminView
        ? 'SELECT * FROM categories ORDER BY name ASC'
        : "SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC";
    const categoriesResult = await (0, db_1.query)(sql);
    return res.status(200).json({
        status: 'success',
        results: categoriesResult.rowCount,
        data: {
            categories: categoriesResult.rows,
        },
    });
});
exports.getCategoryByIdOrSlug = (0, catchAsync_1.default)(async (req, res, next) => {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const sql = isUuid
        ? 'SELECT * FROM categories WHERE id = $1'
        : 'SELECT * FROM categories WHERE slug = $1';
    const categoryResult = await (0, db_1.query)(sql, [idOrSlug]);
    const category = categoryResult.rows[0];
    if (!category) {
        return next(new AppError_1.default('Category not found', 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {
            category,
        },
    });
});
exports.createCategory = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, description, image, status } = req.body;
    const slug = (0, slugify_1.default)(name);
    // Check unique slug
    const slugCheck = await (0, db_1.query)('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (slugCheck.rowCount && slugCheck.rowCount > 0) {
        return next(new AppError_1.default('A category with a similar name already exists', 400));
    }
    const result = await (0, db_1.query)(`INSERT INTO categories (name, slug, description, image, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [name, slug, description, image, status || 'active']);
    return res.status(201).json({
        status: 'success',
        data: {
            category: result.rows[0],
        },
    });
});
exports.updateCategory = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, image, status } = req.body;
    // Check category exists
    const checkRes = await (0, db_1.query)('SELECT * FROM categories WHERE id = $1', [id]);
    const category = checkRes.rows[0];
    if (!category) {
        return next(new AppError_1.default('Category not found', 404));
    }
    let slug = category.slug;
    if (name && name !== category.name) {
        slug = (0, slugify_1.default)(name);
        // Check if new slug is unique
        const slugCheck = await (0, db_1.query)('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
        if (slugCheck.rowCount && slugCheck.rowCount > 0) {
            return next(new AppError_1.default('A category with a similar name already exists', 400));
        }
    }
    const updatedName = name !== undefined ? name : category.name;
    const updatedDesc = description !== undefined ? description : category.description;
    const updatedImg = image !== undefined ? image : category.image;
    const updatedStatus = status !== undefined ? status : category.status;
    const result = await (0, db_1.query)(`UPDATE categories
     SET name = $1, slug = $2, description = $3, image = $4, status = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`, [updatedName, slug, updatedDesc, updatedImg, updatedStatus, id]);
    return res.status(200).json({
        status: 'success',
        data: {
            category: result.rows[0],
        },
    });
});
exports.deleteCategory = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deleteRes = await (0, db_1.query)('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
        return next(new AppError_1.default('Category not found', 404));
    }
    return res.status(204).json({
        status: 'success',
        data: null,
    });
});
