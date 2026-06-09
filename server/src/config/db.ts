import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase provides a standard PostgreSQL connection string.
// Use Transaction Mode pooler (port 6543) for application runtime.
// Use Session Mode pooler (port 5432) for migrations.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

pool.on('connect', () => {
  // console.log('Connected to Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PG client', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export { pool };
