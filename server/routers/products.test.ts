/**
 * Products Router Tests
 * Comprehensive test coverage for product CRUD operations and margin calculations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productsRouter } from './products';
import { TRPCError } from '@trpc/server';

// Mock database functions
vi.mock('../db', () => ({
  createProduct: vi.fn(),
  getProductsByWorkspace: vi.fn(),
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getInventoryValuation: vi.fn(),
  getWorkspaceWithPayments: vi.fn(),
}));

import * as db from '../db';

const mockUser = {
  id: 1,
  openId: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  loginMethod: 'oauth',
  role: 'user' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockWorkspace = {
  id: 1,
  userId: 1,
  name: 'Test Workspace',
  businessType: 'Retail',
  logo: null,
  branding: null,
  tier: 'free' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct = {
  id: 1,
  workspaceId: 1,
  name: 'Coffee Beans',
  description: 'Organic coffee',
  sku: 'SKU-001',
  costPerUnit: '5.00',
  sellingPrice: '12.00',
  currentStock: 100,
  lowStockThreshold: 10,
  unit: 'units',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Products Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const mockCreateProduct = vi.mocked(db.createProduct);
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockCreateProduct.mockResolvedValue({ insertId: 1 } as any);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.create({
        name: 'Coffee Beans',
        description: 'Organic coffee',
        sku: 'SKU-001',
        costPerUnit: 5.0,
        sellingPrice: 12.0,
        currentStock: 100,
        lowStockThreshold: 10,
        unit: 'units',
      });

      expect(result.success).toBe(true);
      expect(mockCreateProduct).toHaveBeenCalled();
    });

    it('should fail without authentication', async () => {
      const caller = productsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: 'Coffee Beans',
          costPerUnit: 5.0,
          sellingPrice: 12.0,
        })
      ).rejects.toThrow();
    });

    it('should fail without workspace', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      mockGetWorkspace.mockResolvedValue(null);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: 'Coffee Beans',
          costPerUnit: 5.0,
          sellingPrice: 12.0,
        })
      ).rejects.toThrow();
    });

    it('should validate product name', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      mockGetWorkspace.mockResolvedValue(mockWorkspace);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: '',
          costPerUnit: 5.0,
          sellingPrice: 12.0,
        })
      ).rejects.toThrow();
    });

    it('should validate cost per unit', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      mockGetWorkspace.mockResolvedValue(mockWorkspace);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: 'Coffee',
          costPerUnit: -5.0,
          sellingPrice: 12.0,
        })
      ).rejects.toThrow();
    });

    it('should validate selling price', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      mockGetWorkspace.mockResolvedValue(mockWorkspace);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: 'Coffee',
          costPerUnit: 5.0,
          sellingPrice: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all products for workspace', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([mockProduct]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Coffee Beans');
      expect(result[0].profitPerUnit).toBe(7.0); // 12 - 5
      expect(result[0].profitMarginPercent).toBe('58.33'); // (7/12)*100
    });

    it('should return empty list when no products', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();
      expect(result).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const caller = productsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.list()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should get product by ID', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([mockProduct]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getById({ id: 1 });

      expect(result.name).toBe('Coffee Beans');
      expect(result.costPerUnit).toBe(5.0);
      expect(result.sellingPrice).toBe(12.0);
    });

    it('should fail for non-existent product', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.getById({ id: 999 })).rejects.toThrow();
    });

    it('should fail for product from different workspace', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([
        { ...mockProduct, workspaceId: 999 },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.getById({ id: 1 })).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);
      const mockUpdateProduct = vi.mocked(db.updateProduct);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([mockProduct]);
      mockUpdateProduct.mockResolvedValue({ changes: 1 } as any);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.update({
        id: 1,
        data: {
          name: 'Updated Coffee',
          sellingPrice: 15.0,
        },
      });

      expect(result.success).toBe(true);
      expect(mockUpdateProduct).toHaveBeenCalled();
    });

    it('should fail for non-existent product', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.update({
          id: 999,
          data: { name: 'Updated' },
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);
      const mockDeleteProduct = vi.mocked(db.deleteProduct);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([mockProduct]);
      mockDeleteProduct.mockResolvedValue({ changes: 1 } as any);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(mockDeleteProduct).toHaveBeenCalled();
    });

    it('should fail for non-existent product', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProduct = vi.mocked(db.getProductById);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProduct.mockResolvedValue([]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.delete({ id: 999 })).rejects.toThrow();
    });
  });

  describe('getValuation', () => {
    it('should calculate inventory valuation', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetValuation = vi.mocked(db.getInventoryValuation);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetValuation.mockResolvedValue([
        {
          id: 1,
          name: 'Coffee Beans',
          sku: 'SKU-001',
          currentStock: 100,
          costPerUnit: 5.0,
          sellingPrice: 12.0,
          totalCostValue: 500.0,
          totalSellingValue: 1200.0,
          profitPerUnit: 7.0,
          profitMarginPercent: '58.33',
        },
        {
          id: 2,
          name: 'Tea Leaves',
          sku: 'SKU-002',
          currentStock: 50,
          costPerUnit: 3.0,
          sellingPrice: 8.0,
          totalCostValue: 150.0,
          totalSellingValue: 400.0,
          profitPerUnit: 5.0,
          profitMarginPercent: '62.50',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getValuation();

      expect(result.products).toHaveLength(2);
      expect(result.summary.totalCostValue).toBe(650.0);
      expect(result.summary.totalSellingValue).toBe(1600.0);
      expect(result.summary.totalProfitPotential).toBe(950.0);
      expect(result.summary.productCount).toBe(2);
    });

    it('should handle empty inventory', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetValuation = vi.mocked(db.getInventoryValuation);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetValuation.mockResolvedValue([]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getValuation();

      expect(result.products).toHaveLength(0);
      expect(result.summary.totalCostValue).toBe(0);
      expect(result.summary.totalSellingValue).toBe(0);
      expect(result.summary.totalProfitPotential).toBe(0);
      expect(result.summary.overallMarginPercent).toBe(0);
    });

    it('should calculate correct margin percentage', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetValuation = vi.mocked(db.getInventoryValuation);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetValuation.mockResolvedValue([
        {
          id: 1,
          name: 'Product',
          sku: 'SKU-001',
          currentStock: 100,
          costPerUnit: 10.0,
          sellingPrice: 20.0,
          totalCostValue: 1000.0,
          totalSellingValue: 2000.0,
          profitPerUnit: 10.0,
          profitMarginPercent: '50.00',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getValuation();

      expect(result.summary.overallMarginPercent).toBe(50.0);
    });
  });

  describe('Margin Calculations', () => {
    it('should calculate profit per unit correctly', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([
        {
          ...mockProduct,
          costPerUnit: '5.00',
          sellingPrice: '15.00',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();

      expect(result[0].profitPerUnit).toBe(10.0); // 15 - 5
    });

    it('should calculate margin percentage correctly', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([
        {
          ...mockProduct,
          costPerUnit: '8.00',
          sellingPrice: '20.00',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();

      // (20 - 8) / 20 * 100 = 60%
      expect(result[0].profitMarginPercent).toBe('60.00');
    });

    it('should calculate total cost value correctly', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([
        {
          ...mockProduct,
          currentStock: 50,
          costPerUnit: '10.00',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();

      expect(result[0].totalCostValue).toBe(500.0); // 50 * 10
    });

    it('should calculate total selling value correctly', async () => {
      const mockGetWorkspace = vi.mocked(db.getWorkspaceWithPayments);
      const mockGetProducts = vi.mocked(db.getProductsByWorkspace);

      mockGetWorkspace.mockResolvedValue(mockWorkspace);
      mockGetProducts.mockResolvedValue([
        {
          ...mockProduct,
          currentStock: 50,
          sellingPrice: '25.00',
        },
      ]);

      const caller = productsRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.list();

      expect(result[0].totalSellingValue).toBe(1250.0); // 50 * 25
    });
  });
});
