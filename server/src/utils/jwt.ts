import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_12398412';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_98412498';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY as any }
  );
};

export const generateRefreshToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY as any }
  );
};

export const verifyAccessToken = (token: string): UserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as UserPayload;
};

export const verifyRefreshToken = (token: string): UserPayload => {
  return jwt.verify(token, REFRESH_SECRET) as UserPayload;
};
