import { router } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    const [users] = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const [workspaces] = await db.execute(sql`SELECT COUNT(*) as count FROM workspaces`);
    const [orders] = await db.execute(sql`SELECT COUNT(*) as count, SUM(totalPrice) as revenue FROM orders`);
    const [products] = await db.execute(sql`SELECT COUNT(*) as count FROM products`);
    const [runs] = await db.execute(sql`SELECT COUNT(*) as count FROM productionRuns`);
    return {
      users: (users as any)[0]?.count || 0,
      workspaces: (workspaces as any)[0]?.count || 0,
      orders: (orders as any)[0]?.count || 0,
      revenue: (orders as any)[0]?.revenue || 0,
      products: (products as any)[0]?.count || 0,
      productionRuns: (runs as any)[0]?.count || 0,
    };
  }),

  users: adminProcedure.query(async () => {
    const db = await getDb();
    const result = await db.execute(sql`
      SELECT u.id, u.name, u.email, u.role, u.createdAt,
        w.id as workspaceId, w.name as workspaceName,
        (SELECT COUNT(*) FROM orders o WHERE o.workspaceId = w.id) as orderCount,
        (SELECT COUNT(*) FROM products p WHERE p.workspaceId = w.id) as productCount
      FROM users u
      LEFT JOIN workspaces w ON w.userId = u.id
      ORDER BY u.createdAt DESC
    `);
    const rows = (result as any)[0] ?? result;
    return rows;
  }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`UPDATE users SET role = ${input.role} WHERE id = ${input.userId}`);
      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM users WHERE id = ${input.userId}`);
      return { success: true };
    }),

  workspaces: adminProcedure.query(async () => {
    const db = await getDb();
    const result = await db.execute(sql`
      SELECT w.id, w.name, w.createdAt,
        u.name as ownerName, u.email as ownerEmail, u.role as ownerRole,
        (SELECT COUNT(*) FROM orders o WHERE o.workspaceId = w.id) as orders,
        (SELECT COUNT(*) FROM products p WHERE p.workspaceId = w.id) as products,
        (SELECT COUNT(*) FROM productionRuns r WHERE r.workspaceId = w.id) as runs,
        (SELECT SUM(totalPrice) FROM orders o WHERE o.workspaceId = w.id) as revenue
      FROM workspaces w
      LEFT JOIN users u ON u.id = w.userId
      ORDER BY w.createdAt DESC
    `);
    const rows = (result as any)[0] ?? result;
    return rows;
  }),
});
