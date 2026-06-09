"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductByIdOrSlug = exports.getProducts = void 0;
const db_1 = require("../config/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const slugify_1 = __importDefault(require("../utils/slugify"));
exports.getProducts = (0, catchAsync_1.default)(async (req, res, next) => {
    const { category, category_id, availability, puffCountMin, puffCountMax, nicotineStrength, search, sort = 'created_at', order = 'desc', page = '1', limit = '10', admin = 'false', } = req.query;
    const isAdminView = admin === 'true';
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    const queryParams = [];
    const whereClauses = [];
    // Filter by status (active only for public views)
    if (!isAdminView) {
        whereClauses.push("p.status = 'active'");
        whereClauses.push("c.status = 'active'");
    }
    // Filter by category slug
    if (category) {
        queryParams.push(category);
        whereClauses.push(`c.slug = $${queryParams.length}`);
    }
    // Filter by category ID
    if (category_id) {
        queryParams.push(category_id);
        whereClauses.push(`p.category_id = $${queryParams.length}`);
    }
    // Filter by availability
    if (availability) {
        queryParams.push(availability);
        whereClauses.push(`p.availability = $${queryParams.length}`);
    }
    // Filter by puff count ranges
    if (puffCountMin) {
        queryParams.push(parseInt(puffCountMin, 10));
        whereClauses.push(`p.puff_count >= $${queryParams.length}`);
    }
    if (puffCountMax) {
        queryParams.push(parseInt(puffCountMax, 10));
        whereClauses.push(`p.puff_count <= $${queryParams.length}`);
    }
    // Filter by nicotine strength
    if (nicotineStrength) {
        queryParams.push(parseFloat(nicotineStrength));
        whereClauses.push(`p.nicotine_strength = $${queryParams.length}`);
    }
    // Filter by search query (matches name or description)
    if (search) {
        queryParams.push(`%${search}%`);
        whereClauses.push(`(p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`);
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // 1. Get total count for pagination
    const countSql = `
    SELECT COUNT(*) 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSql}
  `;
    const countResult = await (0, db_1.query)(countSql, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    // 2. Fetch paginated products with category details
    // Verify sort parameters are safe from SQL injection
    const allowedSortFields = ['price', 'created_at', 'name', 'puff_count'];
    const allowedOrders = ['asc', 'desc'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'created_at';
    const safeOrder = allowedOrders.includes(order.toString().toLowerCase()) ? order : 'desc';
    const fetchSql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSql}
    ORDER BY p.${safeSort} ${safeOrder}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
    const fetchParams = [...queryParams, limitNum, offset];
    const productsResult = await (0, db_1.query)(fetchSql, fetchParams);
    return res.status(200).json({
        status: 'success',
        data: {
            products: productsResult.rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNum),
            },
        },
    });
});
exports.getProductByIdOrSlug = (0, catchAsync_1.default)(async (req, res, next) => {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    // Get product & category details
    const prodSql = isUuid
        ? `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`
        : `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = $1`;
    const productResult = await (0, db_1.query)(prodSql, [idOrSlug]);
    const product = productResult.rows[0];
    if (!product) {
        return next(new AppError_1.default('Product not found', 404));
    }
    // Get product flavors
    const flavorsResult = await (0, db_1.query)("SELECT id, flavor_name, status FROM flavors WHERE product_id = $1 AND status = 'active' ORDER BY flavor_name ASC", [product.id]);
    // Get all images
    const imagesResult = await (0, db_1.query)('SELECT id, image_url, sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC', [product.id]);
    return res.status(200).json({
        status: 'success',
        data: {
            product: {
                ...product,
                flavors: flavorsResult.rows,
                images: imagesResult.rows,
            },
        },
    });
});
exports.createProduct = (0, catchAsync_1.default)(async (req, res, next) => {
    const { category_id, name, description, image, puff_count, nicotine_strength, price, availability, status, flavors, } = req.body;
    const slug = (0, slugify_1.default)(name);
    // Check unique slug
    const slugCheck = await (0, db_1.query)('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rowCount && slugCheck.rowCount > 0) {
        return next(new AppError_1.default('A product with a similar name already exists', 400));
    }
    // Insert product
    const result = await (0, db_1.query)(`INSERT INTO products (category_id, name, slug, description, image, puff_count, nicotine_strength, price, availability, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`, [
        category_id,
        name,
        slug,
        description,
        image,
        puff_count || null,
        nicotine_strength || 0.0,
        price,
        availability || 'in_stock',
        status || 'active',
    ]);
    const product = result.rows[0];
    // Insert primary image into secondary images list
    if (image) {
        await (0, db_1.query)('INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, 0)', [product.id, image]);
    }
    // Seed flavors if supplied
    const insertedFlavors = [];
    if (flavors && Array.isArray(flavors)) {
        for (const fName of flavors) {
            if (typeof fName === 'string' && fName.trim().length > 0) {
                const flavRes = await (0, db_1.query)('INSERT INTO flavors (product_id, flavor_name, status) VALUES ($1, $2, $3) RETURNING *', [product.id, fName.trim(), 'active']);
                insertedFlavors.push(flavRes.rows[0]);
            }
        }
    }
    return res.status(201).json({
        status: 'success',
        data: {
            product: {
                ...product,
                flavors: insertedFlavors,
            },
        },
    });
});
exports.updateProduct = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { category_id, name, description, image, puff_count, nicotine_strength, price, availability, status, } = req.body;
    // Check product exists
    const checkRes = await (0, db_1.query)('SELECT * FROM products WHERE id = $1', [id]);
    const product = checkRes.rows[0];
    if (!product) {
        return next(new AppError_1.default('Product not found', 404));
    }
    let slug = product.slug;
    if (name && name !== product.name) {
        slug = (0, slugify_1.default)(name);
        // Check unique slug
        const slugCheck = await (0, db_1.query)('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
        if (slugCheck.rowCount && slugCheck.rowCount > 0) {
            return next(new AppError_1.default('A product with a similar name already exists', 400));
        }
    }
    const updatedCategoryId = category_id !== undefined ? category_id : product.category_id;
    const updatedName = name !== undefined ? name : product.name;
    const updatedDesc = description !== undefined ? description : product.description;
    const updatedImg = image !== undefined ? image : product.image;
    const updatedPuffCount = puff_count !== undefined ? puff_count : product.puff_count;
    const updatedNicStrength = nicotine_strength !== undefined ? nicotine_strength : product.nicotine_strength;
    const updatedPrice = price !== undefined ? price : product.price;
    const updatedAvailability = availability !== undefined ? availability : product.availability;
    const updatedStatus = status !== undefined ? status : product.status;
    const result = await (0, db_1.query)(`UPDATE products
     SET category_id = $1, name = $2, slug = $3, description = $4, image = $5, 
         puff_count = $6, nicotine_strength = $7, price = $8, availability = $9, status = $10, updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING *`, [
        updatedCategoryId,
        updatedName,
        slug,
        updatedDesc,
        updatedImg,
        updatedPuffCount,
        updatedNicStrength,
        updatedPrice,
        updatedAvailability,
        updatedStatus,
        id,
    ]);
    // If primary image was updated, let's verify if it exists in product_images. If not, add/update it.
    if (image && image !== product.image) {
        const imgCheck = await (0, db_1.query)('SELECT id FROM product_images WHERE product_id = $1 AND sort_order = 0', [id]);
        if (imgCheck.rowCount && imgCheck.rowCount > 0) {
            await (0, db_1.query)('UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND sort_order = 0', [image, id]);
        }
        else {
            await (0, db_1.query)('INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, 0)', [id, image]);
        }
    }
    return res.status(200).json({
        status: 'success',
        data: {
            product: result.rows[0],
        },
    });
});
exports.deleteProduct = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deleteRes = await (0, db_1.query)('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
        return next(new AppError_1.default('Product not found', 404));
    }
    return res.status(204).json({
        status: 'success',
        data: null,
    });
});
