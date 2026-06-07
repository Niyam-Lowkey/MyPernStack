import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import slugify from '../utils/slugify';

export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // If request indicates admin mode, return all categories. Otherwise return active only.
  const isAdminView = req.query.admin === 'true';
  const sql = isAdminView
    ? 'SELECT * FROM categories ORDER BY name ASC'
    : "SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC";

  const categoriesResult = await query(sql);
  
  return res.status(200).json({
    status: 'success',
    results: categoriesResult.rowCount,
    data: {
      categories: categoriesResult.rows,
    },
  });
});

export const getCategoryByIdOrSlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { idOrSlug } = req.params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const sql = isUuid
    ? 'SELECT * FROM categories WHERE id = $1'
    : 'SELECT * FROM categories WHERE slug = $1';

  const categoryResult = await query(sql, [idOrSlug]);
  const category = categoryResult.rows[0];

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, image, status } = req.body;
  const slug = slugify(name);

  // Check unique slug
  const slugCheck = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (slugCheck.rowCount && slugCheck.rowCount > 0) {
    return next(new AppError('A category with a similar name already exists', 400));
  }

  const result = await query(
    `INSERT INTO categories (name, slug, description, image, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, slug, description, image, status || 'active']
  );

  return res.status(201).json({
    status: 'success',
    data: {
      category: result.rows[0],
    },
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, image, status } = req.body;

  // Check category exists
  const checkRes = await query('SELECT * FROM categories WHERE id = $1', [id]);
  const category = checkRes.rows[0];
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  let slug = category.slug;
  if (name && name !== category.name) {
    slug = slugify(name);
    // Check if new slug is unique
    const slugCheck = await query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
    if (slugCheck.rowCount && slugCheck.rowCount > 0) {
      return next(new AppError('A category with a similar name already exists', 400));
    }
  }

  const updatedName = name !== undefined ? name : category.name;
  const updatedDesc = description !== undefined ? description : category.description;
  const updatedImg = image !== undefined ? image : category.image;
  const updatedStatus = status !== undefined ? status : category.status;

  const result = await query(
    `UPDATE categories
     SET name = $1, slug = $2, description = $3, image = $4, status = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [updatedName, slug, updatedDesc, updatedImg, updatedStatus, id]
  );

  return res.status(200).json({
    status: 'success',
    data: {
      category: result.rows[0],
    },
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const deleteRes = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

  if (deleteRes.rowCount === 0) {
    return next(new AppError('Category not found', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
