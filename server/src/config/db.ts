import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: Pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vape_catalog',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });
}

pool.on('connect', () => {
  // console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PG client', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export { pool };
