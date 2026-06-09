"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_service_1 = require("./services/db.service");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const flavor_routes_1 = __importDefault(require("./routes/flavor.routes"));
const banner_routes_1 = __importDefault(require("./routes/banner.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const AppError_1 = __importDefault(require("./utils/AppError"));
// Load environmental configurations
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // Allows displaying local uploaded images in React frontend
}));
// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173', // Default Vite port
    'http://localhost:3000',
    process.env.CLIENT_URL || '',
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Request body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Custom Cookie Parser Middleware (saves external dependencies)
app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    req.cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
            const parts = cookie.split('=');
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            req.cookies[key] = decodeURIComponent(val);
        });
    }
    next();
});
// Static files server for local uploads fallback
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/flavors', flavor_routes_1.default);
app.use('/api/banners', banner_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
// Base route healthcheck
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Vape Catalog API is active and healthy.' });
});
// Catch-all route for unhandled routes
app.all('*', (req, res, next) => {
    next(new AppError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(error_middleware_1.default);
// Database initialization & server startup
const startServer = async () => {
    try {
        console.log('Connecting to database and running migrations...');
        await (0, db_service_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server due to database migration error:', error);
        console.log('Server is running in recovery mode (DB query triggers will fail until DB starts). Listening on port', PORT);
        // In case DB is not running locally, we still boot the server so developer can inspect API/UI
        app.listen(PORT, () => {
            console.log(`🚀 Server running in RECOVERY MODE on port ${PORT}. Please ensure PostgreSQL is running.`);
        });
    }
};
startServer();
