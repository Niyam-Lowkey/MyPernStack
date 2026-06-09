"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Supabase provides a standard PostgreSQL connection string.
// Use Transaction Mode pooler (port 6543) for application runtime.
// Use Session Mode pooler (port 5432) for migrations.
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
});
exports.pool = pool;
pool.on('connect', () => {
    // console.log('Connected to Supabase PostgreSQL');
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle PG client', err);
});
const query = (text, params) => {
    return pool.query(text, params);
};
exports.query = query;
