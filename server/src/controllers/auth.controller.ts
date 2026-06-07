import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, rememberMe } = req.body;

  // 1. Fetch user from DB
  const userResult = await query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  const user = userResult.rows[0];

  if (!user || !user.is_active) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 3. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 4. Set Refresh Token in Cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
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

export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Fetch user to confirm they still exist/are active
    const userResult = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = userResult.rows[0];
    if (!user || !user.is_active) {
      return next(new AppError('User is no longer active or does not exist', 401));
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return next(new AppError('Expired or invalid refresh token', 401));
  }
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const userResult = await query(
    'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
    [req.user.id]
      );
    
      const user = userResult.rows[0];
      if (!user) {
        return next(new AppError('User not found', 404));
      }
    
      return res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    });
