import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

const schemaPath = path.join(__dirname, '../models/schema.sql');

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting database schema migration...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    await client.query(schemaSql);
    console.log('Schema migration completed successfully.');

    console.log('Checking for existing users to seed...');
    const userCheck = await client.query("SELECT COUNT(*) FROM users");
    const userCount = parseInt(userCheck.rows[0].count, 10);

    if (userCount === 0) {
      console.log('No users found. Seeding initial data...');
      
// Hash admin password
const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

// 1. Seed Admin User
const adminResult = await client.query(
  `INSERT INTO users (name, email, password_hash, role, is_active)
   VALUES ($1, $2, $3, $4, $5) RETURNING id`,
  ['System Administrator', 'admin@vapeco.com', adminPasswordHash, 'admin', true]
);
const adminId = adminResult.rows[0].id;
console.log(`Seeded admin user: admin@vapeco.com (ID: ${adminId})`);

      // 2. Seed Homepage Banners
      const banners = [
        {
          title: 'VapePro Apex 10k',
          subtitle: 'Uncompromising performance. Up to 10,000 puffs of pure flavor profile with adjustable airflow control and LED display screen.',
          image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200',
          link_url: '/product/apex-10k-disposable',
          sort_order: 0
        },
        {
          title: 'Premium Pod Systems',
          subtitle: 'Experience the sleek and powerful design crafted for pure satisfaction and flavor fidelity.',
          image_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1200',
          link_url: '/category/pod-systems',
          sort_order: 1
        }
      ];

      for (const banner of banners) {
        await client.query(
          `INSERT INTO homepage_banners (title, subtitle, image_url, link_url, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [banner.title, banner.subtitle, banner.image_url, banner.link_url, banner.sort_order]
        );
      }
      console.log('Seeded homepage banners.');

      // 3. Seed Categories
      const categories = [
        {
          name: 'Disposable Vapes',
          slug: 'disposable-vapes',
          description: 'All-in-one puff devices pre-filled with delicious nic-salts. No refilling, no fuss.',
          image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
          status: 'active'
        },
        {
          name: 'Pod Systems',
          slug: 'pod-systems',
          description: 'Refillable, rechargeable devices with replaceable pods. Compact and high-performance.',
          image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
          status: 'active'
        },
        {
          name: 'E-Liquids',
          slug: 'e-liquids',
          description: 'Vibrant juices, freebase e-liquids and smooth nicotine salts in varied strengths.',
          image: 'https://images.unsplash.com/photo-1509315811347-67fd3b15144a?q=80&w=600',
          status: 'active'
        }
      ];

      const categoryMap = new Map<string, string>();
      for (const cat of categories) {
        const catRes = await client.query(
          `INSERT INTO categories (name, slug, description, image, status)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [cat.name, cat.slug, cat.description, cat.image, cat.status]
        );
        categoryMap.set(cat.slug, catRes.rows[0].id);
      }
      console.log('Seeded product categories.');

      // 4. Seed Products
      const products = [
        {
          categorySlug: 'disposable-vapes',
          name: 'Apex 10k Disposable',
          slug: 'apex-10k-disposable',
          description: 'The Apex 10k features an advanced dual-mesh coil, a clear LED screen indicating battery and juice levels, a rechargeable Type-C port, and robust airflow adjustability. Enjoy 10,000 puffs of dense, flavorful satisfaction.',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
          puff_count: 10000,
          nicotine_strength: 5.0,
          price: 21.99,
          availability: 'in_stock',
          status: 'active',
          flavors: ['Blue Razz Ice', 'Watermelon Bubblegum', 'Strawberry Kiwi', 'Mint Chill']
        },
        {
          categorySlug: 'disposable-vapes',
          name: 'Lite Bar 5000',
          slug: 'lite-bar-5000',
          description: 'Compact, pocket-friendly disposable vape pre-filled with premium 5% nicotine salt e-liquid. Delivers a smooth throat hit with a draw-activated firing mechanism.',
          image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600',
          puff_count: 5000,
          nicotine_strength: 5.0,
          price: 14.99,
          availability: 'in_stock',
          status: 'active',
          flavors: ['Mango Peach', 'Grape Soda', 'Double Apple']
        },
        {
          categorySlug: 'pod-systems',
          name: 'Pulse Pod System Kit',
          slug: 'pulse-pod-kit',
          description: 'The Pulse Pod Kit is a sleek open-system device featuring an 800mAh battery, custom wattage adjustment (5-30W), and a 2ml refillable pod with integrated mesh coil technology. Includes fast charging.',
          image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
          puff_count: null,
          nicotine_strength: 0.0,
          price: 34.99,
          availability: 'in_stock',
          status: 'active',
          flavors: ['Classic Charcoal', 'Aurora Blue', 'Sunset Pink']
        },
        {
          categorySlug: 'e-liquids',
          name: 'Cloud Nine Strawberry Ice Salt',
          slug: 'cloud-nine-strawberry-ice-salt',
          description: 'Indulge in the flavor of sweet summer strawberries blended with a crisp, cool menthol breeze. Specially formulated for high nicotine salt-compatible pod systems.',
          image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
          puff_count: null,
          nicotine_strength: 3.5,
          price: 15.99,
          availability: 'in_stock',
          status: 'active',
          flavors: ['35mg Salt Nic', '50mg Salt Nic']
        }
      ];

      for (const prod of products) {
        const categoryId = categoryMap.get(prod.categorySlug);
        if (!categoryId) continue;

        const prodRes = await client.query(
          `INSERT INTO products (category_id, name, slug, description, image, puff_count, nicotine_strength, price, availability, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [
            categoryId,
            prod.name,
            prod.slug,
            prod.description,
            prod.image,
            prod.puff_count,
            prod.nicotine_strength,
            prod.price,
            prod.availability,
            prod.status
          ]
        );
        const productId = prodRes.rows[0].id;

        // Seed product secondary images
        await client.query(
          `INSERT INTO product_images (product_id, image_url, sort_order)
           VALUES ($1, $2, $3)`,
          [productId, prod.image, 0]
        );

        // Seed flavors
        for (const flavor of prod.flavors) {
          await client.query(
            `INSERT INTO flavors (product_id, flavor_name, status)
             VALUES ($1, $2, $3)`,
            [productId, flavor, 'active']
          );
        }
      }
      console.log('Seeded catalog products and flavors.');
    } else {
      console.log('Users exist. Database seeding skipped.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// If run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database operation completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database migration/seed script failed:', err);
      process.exit(1);
    });
}
