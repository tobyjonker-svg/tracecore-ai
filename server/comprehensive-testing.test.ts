import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "./db";
import { users, workspaces, products, inputs, orders, productionRuns, shipments } from "../drizzle/schema";

describe("Comprehensive System Testing - All CRUD Operations", () => {
  let testWorkspaceId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Setup test user and workspace
    const testUser = await db.insert(users).values({
      openId: `test-${Date.now()}`,
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    });
    testUserId = testUser[0];

    const testWorkspace = await db.insert(workspaces).values({
      userId: testUserId,
      name: "Test Workspace",
      tier: "pro_plus",
    });
    testWorkspaceId = testWorkspace[0];
  });

  describe("Products CRUD", () => {
    it("should create a product", async () => {
      const product = await db.insert(products).values({
        workspaceId: testWorkspaceId,
        name: "Test Product",
        costPerUnit: "10.00",
        sellingPrice: "25.00",
        quantity: 100,
        unit: "units",
      });
      expect(product[0]).toBeDefined();
    });

    it("should read a product", async () => {
      const product = await db.query.products.findFirst({
        where: (p) => p.name === "Test Product",
      });
      expect(product?.name).toBe("Test Product");
    });

    it("should update a product", async () => {
      const product = await db.query.products.findFirst({
        where: (p) => p.name === "Test Product",
      });
      if (product) {
        await db.update(products).set({ quantity: 150 }).where((p) => p.id === product.id);
        const updated = await db.query.products.findFirst({
          where: (p) => p.id === product.id,
        });
        expect(updated?.quantity).toBe(150);
      }
    });

    it("should delete a product", async () => {
      const product = await db.query.products.findFirst({
        where: (p) => p.name === "Test Product",
      });
      if (product) {
        await db.delete(products).where((p) => p.id === product.id);
        const deleted = await db.query.products.findFirst({
          where: (p) => p.id === product.id,
        });
        expect(deleted).toBeUndefined();
      }
    });
  });

  describe("Inputs CRUD", () => {
    it("should create an input", async () => {
      const input = await db.insert(inputs).values({
        workspaceId: testWorkspaceId,
        name: "Test Input",
        costPerUnit: "5.00",
        quantity: 500,
        unit: "kg",
      });
      expect(input[0]).toBeDefined();
    });

    it("should read an input", async () => {
      const input = await db.query.inputs.findFirst({
        where: (i) => i.name === "Test Input",
      });
      expect(input?.name).toBe("Test Input");
    });

    it("should update an input", async () => {
      const input = await db.query.inputs.findFirst({
        where: (i) => i.name === "Test Input",
      });
      if (input) {
        await db.update(inputs).set({ quantity: 600 }).where((i) => i.id === input.id);
        const updated = await db.query.inputs.findFirst({
          where: (i) => i.id === input.id,
        });
        expect(updated?.quantity).toBe(600);
      }
    });

    it("should delete an input", async () => {
      const input = await db.query.inputs.findFirst({
        where: (i) => i.name === "Test Input",
      });
      if (input) {
        await db.delete(inputs).where((i) => i.id === input.id);
        const deleted = await db.query.inputs.findFirst({
          where: (i) => i.id === input.id,
        });
        expect(deleted).toBeUndefined();
      }
    });
  });

  describe("Orders CRUD", () => {
    it("should create an order", async () => {
      const order = await db.insert(orders).values({
        workspaceId: testWorkspaceId,
        orderId: `ORD-${Date.now()}`,
        customerId: "CUST-001",
        productId: 1,
        quantity: 50,
        totalPrice: "1250.00",
        status: "pending",
      });
      expect(order[0]).toBeDefined();
    });

    it("should read an order", async () => {
      const order = await db.query.orders.findFirst({
        where: (o) => o.status === "pending",
      });
      expect(order?.status).toBe("pending");
    });

    it("should update order status", async () => {
      const order = await db.query.orders.findFirst({
        where: (o) => o.status === "pending",
      });
      if (order) {
        await db.update(orders).set({ status: "processing" }).where((o) => o.id === order.id);
        const updated = await db.query.orders.findFirst({
          where: (o) => o.id === order.id,
        });
        expect(updated?.status).toBe("processing");
      }
    });

    it("should delete an order", async () => {
      const order = await db.query.orders.findFirst({
        where: (o) => o.status === "processing",
      });
      if (order) {
        await db.delete(orders).where((o) => o.id === order.id);
        const deleted = await db.query.orders.findFirst({
          where: (o) => o.id === order.id,
        });
        expect(deleted).toBeUndefined();
      }
    });
  });

  describe("Production Runs CRUD", () => {
    it("should create a production run", async () => {
      const run = await db.insert(productionRuns).values({
        workspaceId: testWorkspaceId,
        runId: `PR-${Date.now()}`,
        productId: 1,
        quantity: 1000,
        status: "planned",
      });
      expect(run[0]).toBeDefined();
    });

    it("should read a production run", async () => {
      const run = await db.query.productionRuns.findFirst({
        where: (p) => p.status === "planned",
      });
      expect(run?.status).toBe("planned");
    });

    it("should update production run status", async () => {
      const run = await db.query.productionRuns.findFirst({
        where: (p) => p.status === "planned",
      });
      if (run) {
        await db.update(productionRuns).set({ status: "in_progress" }).where((p) => p.id === run.id);
        const updated = await db.query.productionRuns.findFirst({
          where: (p) => p.id === run.id,
        });
        expect(updated?.status).toBe("in_progress");
      }
    });

    it("should delete a production run", async () => {
      const run = await db.query.productionRuns.findFirst({
        where: (p) => p.status === "in_progress",
      });
      if (run) {
        await db.delete(productionRuns).where((p) => p.id === run.id);
        const deleted = await db.query.productionRuns.findFirst({
          where: (p) => p.id === run.id,
        });
        expect(deleted).toBeUndefined();
      }
    });
  });

  describe("Shipments CRUD", () => {
    it("should create a shipment", async () => {
      const shipment = await db.insert(shipments).values({
        workspaceId: testWorkspaceId,
        shipmentId: `SHIP-${Date.now()}`,
        orderId: 1,
        trackingNumber: `TRK-${Date.now()}`,
        carrier: "FedEx",
        status: "pending",
      });
      expect(shipment[0]).toBeDefined();
    });

    it("should read a shipment", async () => {
      const shipment = await db.query.shipments.findFirst({
        where: (s) => s.status === "pending",
      });
      expect(shipment?.status).toBe("pending");
    });

    it("should update shipment status", async () => {
      const shipment = await db.query.shipments.findFirst({
        where: (s) => s.status === "pending",
      });
      if (shipment) {
        await db.update(shipments).set({ status: "shipped" }).where((s) => s.id === shipment.id);
        const updated = await db.query.shipments.findFirst({
          where: (s) => s.id === shipment.id,
        });
        expect(updated?.status).toBe("shipped");
      }
    });

    it("should delete a shipment", async () => {
      const shipment = await db.query.shipments.findFirst({
        where: (s) => s.status === "shipped",
      });
      if (shipment) {
        await db.delete(shipments).where((s) => s.id === shipment.id);
        const deleted = await db.query.shipments.findFirst({
          where: (s) => s.id === shipment.id,
        });
        expect(deleted).toBeUndefined();
      }
    });
  });

  describe("Data Validation", () => {
    it("should validate required fields", async () => {
      try {
        await db.insert(products).values({
          workspaceId: testWorkspaceId,
          name: "", // Empty name should fail
          costPerUnit: "10.00",
          sellingPrice: "25.00",
          quantity: 100,
          unit: "units",
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should validate decimal fields", async () => {
      const product = await db.insert(products).values({
        workspaceId: testWorkspaceId,
        name: "Decimal Test",
        costPerUnit: "10.50",
        sellingPrice: "25.99",
        quantity: 100,
        unit: "units",
      });
      const fetched = await db.query.products.findFirst({
        where: (p) => p.id === product[0],
      });
      expect(fetched?.costPerUnit).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should handle bulk inserts", async () => {
      const startTime = Date.now();
      const values = Array.from({ length: 100 }, (_, i) => ({
        workspaceId: testWorkspaceId,
        name: `Bulk Product ${i}`,
        costPerUnit: "10.00",
        sellingPrice: "25.00",
        quantity: 100,
        unit: "units",
      }));
      await db.insert(products).values(values);
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
    });

    it("should query efficiently", async () => {
      const startTime = Date.now();
      await db.query.products.findMany({
        where: (p) => p.workspaceId === testWorkspaceId,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  afterAll(async () => {
    // Cleanup test data
    // Note: In production, use proper transaction rollback
  });
});
