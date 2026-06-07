import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

export const getBanners = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const isAdminView = req.query.admin === 'true';
  const sql = isAdminView
    ? 'SELECT * FROM homepage_banners ORDER BY sort_order ASC, created_at DESC'
    : "SELECT * FROM homepage_banners WHERE is_active = true ORDER BY sort_order ASC, created_at DESC";

  const result = await query(sql);

  return res.status(200).json({
    status: 'success',
    results: result.rowCount,
    data: {
      banners: result.rows,
    },
  });
});

export const createBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, subtitle, image_url, link_url, sort_order, is_active } = req.body;

  if (!title || !image_url) {
    return next(new AppError('Title and Image URL are required', 400));
  }

  const result = await query(
    `INSERT INTO homepage_banners (title, subtitle, image_url, link_url, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, subtitle || null, image_url, link_url || null, sort_order || 0, is_active !== undefined ? is_active : true]
  );

  return res.status(201).json({
    status: 'success',
    data: {
      banner: result.rows[0],
    },
  });
});

export const updateBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, subtitle, image_url, link_url, sort_order, is_active } = req.body;

  const check = await query('SELECT * FROM homepage_banners WHERE id = $1', [id]);
  const banner = check.rows[0];
  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  const uTitle = title !== undefined ? title : banner.title;
  const uSubtitle = subtitle !== undefined ? subtitle : banner.subtitle;
  const uImageUrl = image_url !== undefined ? image_url : banner.image_url;
  const uLinkUrl = link_url !== undefined ? link_url : banner.link_url;
  const uSortOrder = sort_order !== undefined ? sort_order : banner.sort_order;
  const uIsActive = is_active !== undefined ? is_active : banner.is_active;

  const result = await query(
    `UPDATE homepage_banners
     SET title = $1, subtitle = $2, image_url = $3, link_url = $4, sort_order = $5, is_active = $6
     WHERE id = $7
     RETURNING *`,
    [uTitle, uSubtitle, uImageUrl, uLinkUrl, uSortOrder, uIsActive, id]
  );

  return res.status(200).json({
    status: 'success',
    data: {
      banner: result.rows[0],
    },
  });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const deleteRes = await query('DELETE FROM homepage_banners WHERE id = $1 RETURNING id', [id]);

  if (deleteRes.rowCount === 0) {
    return next(new AppError('Banner not found', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
