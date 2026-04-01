#!/usr/bin/env node

/**
 * Import MycoAlchemy products into TraceCore AI
 * This script creates the 5 mushroom tincture products with correct SKUs and stock levels
 * Run: node scripts/import-mycoalchemy-products.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  {
    name: "Lion's Mane Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-LM-50",
    woocommerceId: 40,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
    unit: "units",
  },
  {
    name: "Turkey Tail Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-TT-50",
    woocommerceId: 41,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
    unit: "units",
  },
  {
    name: "Reishi Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-REI-50",
    woocommerceId: 214,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
    unit: "units",
  },
  {
    name: "Cordyceps Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-COR-50",
    woocommerceId: 216,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
    unit: "units",
  },
  {
    name: "Full Spectrum Mushroom Blend Tincture 1:3 – 50ml",
    sku: "MYC-BLD-50",
    woocommerceId: 310,
    costPerUnit: 250.00,
    sellingPrice: 399.00,
    currentStock: 30,
    unit: "units",
  },
];

async function importProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tracecore',
  });

  try {
    // Get the workspace ID (assuming first workspace or MycoAlchemy workspace)
    const [workspaces] = await connection.query(
      'SELECT id FROM workspaces WHERE name LIKE ? LIMIT 1',
      ['%MycoAlchemy%']
    );

    let workspaceId;
    if (workspaces.length > 0) {
      workspaceId = workspaces[0].id;
      console.log(`✅ Found MycoAlchemy workspace: ${workspaceId}`);
    } else {
      // Get first workspace if MycoAlchemy not found
      const [firstWorkspace] = await connection.query('SELECT id FROM workspaces LIMIT 1');
      if (firstWorkspace.length === 0) {
        console.error('❌ No workspace found. Please create a workspace first.');
        process.exit(1);
      }
      workspaceId = firstWorkspace[0].id;
      console.log(`⚠️  Using workspace: ${workspaceId}`);
    }

    // Import each product
    for (const product of products) {
      try {
        // Check if product already exists by SKU
        const [existing] = await connection.query(
          'SELECT id FROM products WHERE sku = ? AND workspaceId = ?',
          [product.sku, workspaceId]
        );

        if (existing.length > 0) {
          console.log(`⏭️  Product already exists: ${product.sku}`);
          continue;
        }

        // Insert product
        const [result] = await connection.query(
          `INSERT INTO products (
            workspaceId, name, sku, costPerUnit, sellingPrice, 
            currentStock, unit, lowStockThreshold, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            workspaceId,
            product.name,
            product.sku,
            product.costPerUnit,
            product.sellingPrice,
            product.currentStock,
            product.unit,
            10, // lowStockThreshold
          ]
        );

        console.log(`✅ Imported: ${product.sku} (${product.name})`);
      } catch (error) {
        console.error(`❌ Failed to import ${product.sku}:`, error.message);
      }
    }

    console.log('\n✅ Product import complete!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importProducts();
