import { Router } from 'express'
import mysql from 'mysql2/promise'

const router = Router()

// Same database as the rest of the app, read from .env (DATABASE_URL) rather than a password
// typed into the source - which is how it was until 7 Oct 2026, uncommitted.
const getDB = () => mysql.createPool(process.env.DATABASE_URL as string)

router.use((req, res, next) => {
  const key = req.headers['x-nerve-key']
  if (key !== process.env.NERVE_BRIDGE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

router.get('/status', async (req, res) => {
  res.json({
    platform: 'TraceCore AI',
    status: 'online',
    capabilities: ['orders', 'inventory', 'production', 'shipments', 'products', 'alerts']
  })
})

router.get('/revenue', async (req, res) => {
  try {
    const pool = getDB()
    const [revenue] = await pool.query(`
      SELECT 
        SUM(totalPrice) AS total_revenue,
        COUNT(*) AS total_orders,
        DATE_FORMAT(createdAt, '%Y-%m') AS month
      FROM orders 
      WHERE status != 'cancelled'
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 6
    `)
    res.json({ revenue })
  } catch (e: any) {
    res.status(500).json({ error: 'Could not fetch revenue', detail: e.message })
  }
})

router.get('/inventory', async (req, res) => {
  try {
    const pool = getDB()
    const [inventory] = await pool.query(`
      SELECT name, sku, currentStock, lowStockThreshold, sellingPrice, unit
      FROM products
      ORDER BY currentStock ASC
    `)
    res.json({ inventory })
  } catch (e: any) {
    res.status(500).json({ error: 'Could not fetch inventory', detail: e.message })
  }
})

router.get('/orders', async (req, res) => {
  try {
    const pool = getDB()
    const [orders] = await pool.query(`
      SELECT o.id, o.orderNumber, o.customerName, o.quantity, 
             o.totalPrice, o.status, o.createdAt, p.name as productName
      FROM orders o
      LEFT JOIN products p ON o.productId = p.id
      ORDER BY o.createdAt DESC
      LIMIT 20
    `)
    res.json({ orders })
  } catch (e: any) {
    res.status(500).json({ error: 'Could not fetch orders', detail: e.message })
  }
})

router.get('/production', async (req, res) => {
  try {
    const pool = getDB()
    const [runs] = await pool.query(`
      SELECT pr.id, pr.status, pr.startDate, pr.endDate,
             pr.expectedYield, pr.actualYield, p.name as productName
      FROM productionRuns pr
      LEFT JOIN products p ON pr.id = p.id
      ORDER BY pr.startDate DESC
      LIMIT 10
    `)
    res.json({ productionRuns: runs })
  } catch (e: any) {
    res.status(500).json({ error: 'Could not fetch production runs', detail: e.message })
  }
})

export default router
