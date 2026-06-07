import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './services/db.service';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import flavorRoutes from './routes/flavor.routes';
import bannerRoutes from './routes/banner.routes';
import uploadRoutes from './routes/upload.routes';
import errorHandler from './middlewares/error.middleware';
import AppError from './utils/AppError';

// Load environmental configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows displaying local uploaded images in React frontend
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Default Vite port
  'http://localhost:3000',
  process.env.CLIENT_URL || '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Cookie Parser Middleware (saves external dependencies)
app.use((req: any, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const parts = cookie.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      req.cookies[key] = decodeURIComponent(val);
    });
  }
  next();
});

// Static files server for local uploads fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/flavors', flavorRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);

// Base route healthcheck
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Vape Catalog API is active and healthy.' });
});

// Catch-all route for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Database initialization & server startup
const startServer = async () => {
  try {
    console.log('Connecting to database and running migrations...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database migration error:', error);
    console.log('Server is running in recovery mode (DB query triggers will fail until DB starts). Listening on port', PORT);
    
    // In case DB is not running locally, we still boot the server so developer can inspect API/UI
    app.listen(PORT, () => {
      console.log(`🚀 Server running in RECOVERY MODE on port ${PORT}. Please ensure PostgreSQL is running.`);
    });
  }
};

startServer();
