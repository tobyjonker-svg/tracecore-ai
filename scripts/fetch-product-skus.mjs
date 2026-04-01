#!/usr/bin/env node

/**
 * Fetch existing products from database and extract their SKUs
 * This script connects to the database and retrieves all products
 * so we can match them with the MycoAlchemy products
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

async function fetchProducts() {
  let connection;
  try {
    // Parse DATABASE_URL (format: mysql://user:pass@host:port/database)
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: 'Amazon RDS' in url.hostname ? 'Amazon RDS' : undefined,
    };

    console.log(`📡 Connecting to database: ${config.host}:${config.port}/${config.database}`);
    connection = await mysql.createConnection(config);

    // Query products table
    const [products] = await connection.execute(
      'SELECT id, name, sku, costPerUnit, sellingPrice, currentStock FROM products ORDER BY id'
    );

    console.log(`\n✅ Found ${products.length} products:\n`);
    console.log('┌─────┬────────────────────────────────────────────┬──────────────┬────────┬─────────┐');
    console.log('│ ID  │ Product Name                               │ SKU          │ Cost   │ Stock   │');
    console.log('├─────┼────────────────────────────────────────────┼──────────────┼────────┼─────────┤');

    const productMap = [];

    products.forEach((product) => {
      const nameDisplay = (product.name || 'N/A').substring(0, 42).padEnd(42);
      const skuDisplay = (product.sku || 'N/A').padEnd(12);
      const costDisplay = (product.costPerUnit || '0').padEnd(6);
      const stockDisplay = (product.currentStock || '0').padEnd(7);

      console.log(`│ ${String(product.id).padEnd(3)} │ ${nameDisplay} │ ${skuDisplay} │ ${costDisplay} │ ${stockDisplay} │`);

      productMap.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        cost: product.costPerUnit,
        stock: product.currentStock,
      });
    });

    console.log('└─────┴────────────────────────────────────────────┴──────────────┴────────┴─────────┘\n');

    // Output as JSON for easy copying
    console.log('📋 JSON Format for copying:\n');
    console.log(JSON.stringify(productMap, null, 2));

    // Output as code for updating mycoalchemy-setup.ts
    console.log('\n\n🔧 Update mycoalchemy-setup.ts with these SKUs:\n');
    console.log('const MYCOALCHEMY_PRODUCTS = [');
    productMap.forEach((product) => {
      console.log(`  {`);
      console.log(`    name: "${product.name}",`);
      console.log(`    sku: "${product.sku || 'MYC-UNKNOWN'}",`);
      console.log(`    woocommerceId: ${product.id},`);
      console.log(`    costPerUnit: ${product.cost || 0},`);
      console.log(`    sellingPrice: ${product.cost ? parseFloat(product.cost) * 1.5 : 0},`);
      console.log(`    currentStock: ${product.stock || 0},`);
      console.log(`  },`);
    });
    console.log('];');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fetchProducts();
