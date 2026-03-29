import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock the database functions
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getWorkspaceByUserId: vi.fn(),
    getBatchLots: vi.fn(),
    createBatchLot: vi.fn(),
    getBatchLotById: vi.fn(),
    updateBatchLot: vi.fn(),
    deleteBatchLot: vi.fn(),
    getExpiringBatches: vi.fn(),
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("batches router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns batch lots for workspace", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };
      const mockBatches = [
        {
          id: 1,
          workspaceId: 1,
          productId: 1,
          inputId: null,
          batchNumber: "BATCH-001",
          quantity: "100",
          unit: "kg",
          manufacturedDate: new Date("2026-01-01"),
          expiryDate: new Date("2027-01-01"),
          qualityStatus: "approved" as const,
          notes: "Test batch",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.getBatchLots).mockResolvedValue(mockBatches as any);

      const caller = appRouter.createCaller(ctx);
      const result = await caller.batches.list({ productId: 1 });

      expect(result).toEqual(mockBatches);
      expect(db.getWorkspaceByUserId).toHaveBeenCalledWith(1);
      expect(db.getBatchLots).toHaveBeenCalledWith(1, { productId: 1, inputId: undefined, qualityStatus: undefined });
    });
  });

  describe("create", () => {
    it("creates a new batch lot", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.createBatchLot).mockResolvedValue({ insertId: 1 } as any);

      const caller = appRouter.createCaller(ctx);
      const result = await caller.batches.create({
        productId: 1,
        batchNumber: "BATCH-002",
        quantity: 50,
        unit: "kg",
        expiryDate: new Date("2027-06-01"),
        qualityStatus: "pending",
      });

      expect(result).toEqual({ insertId: 1 });
      expect(db.createBatchLot).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 1,
          productId: 1,
          batchNumber: "BATCH-002",
          quantity: 50,
        })
      );
    });
  });

  describe("getById", () => {
    it("returns batch by ID if user has access", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };
      const mockBatch = {
        id: 1,
        workspaceId: 1,
        productId: 1,
        inputId: null,
        batchNumber: "BATCH-001",
        quantity: "100",
        unit: "kg",
        manufacturedDate: new Date("2026-01-01"),
        expiryDate: new Date("2027-01-01"),
        qualityStatus: "approved" as const,
        notes: "Test batch",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.getBatchLotById).mockResolvedValue(mockBatch as any);

      const caller = appRouter.createCaller(ctx);
      const result = await caller.batches.getById({ id: 1 });

      expect(result).toEqual(mockBatch);
    });

    it("throws NOT_FOUND if batch belongs to different workspace", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };
      const mockBatch = {
        id: 1,
        workspaceId: 999, // Different workspace
        productId: 1,
        inputId: null,
        batchNumber: "BATCH-001",
        quantity: "100",
        unit: "kg",
        manufacturedDate: new Date("2026-01-01"),
        expiryDate: new Date("2027-01-01"),
        qualityStatus: "approved" as const,
        notes: "Test batch",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.getBatchLotById).mockResolvedValue(mockBatch as any);

      const caller = appRouter.createCaller(ctx);

      await expect(caller.batches.getById({ id: 1 })).rejects.toThrow("Batch not found");
    });
  });

  describe("delete", () => {
    it("deletes batch if user has access", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };
      const mockBatch = {
        id: 1,
        workspaceId: 1,
        productId: 1,
        inputId: null,
        batchNumber: "BATCH-001",
        quantity: "100",
        unit: "kg",
        manufacturedDate: new Date("2026-01-01"),
        expiryDate: new Date("2027-01-01"),
        qualityStatus: "approved" as const,
        notes: "Test batch",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.getBatchLotById).mockResolvedValue(mockBatch as any);
      vi.mocked(db.deleteBatchLot).mockResolvedValue({} as any);

      const caller = appRouter.createCaller(ctx);
      const result = await caller.batches.delete({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteBatchLot).toHaveBeenCalledWith(1);
    });
  });

  describe("getExpiring", () => {
    it("returns expiring batches within specified days", async () => {
      const ctx = createAuthContext();
      const mockWorkspace = { id: 1, name: "Test Workspace", userId: 1 };
      const mockExpiringBatches = [
        {
          id: 2,
          workspaceId: 1,
          productId: 1,
          inputId: null,
          batchNumber: "BATCH-EXPIRING",
          quantity: "50",
          unit: "kg",
          manufacturedDate: new Date("2026-01-01"),
          expiryDate: new Date("2026-04-15"),
          qualityStatus: "approved" as const,
          notes: "Expiring soon",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getWorkspaceByUserId).mockResolvedValue(mockWorkspace as any);
      vi.mocked(db.getExpiringBatches).mockResolvedValue(mockExpiringBatches as any);

      const caller = appRouter.createCaller(ctx);
      const result = await caller.batches.getExpiring({ daysUntilExpiry: 30 });

      expect(result).toEqual(mockExpiringBatches);
      expect(db.getExpiringBatches).toHaveBeenCalledWith(1, 30);
    });
  });
});
