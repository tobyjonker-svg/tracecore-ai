import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileRouter } from './profile';
import { getDb } from '../db';
import { storagePut } from '../storage';

// Mock dependencies
vi.mock('../db');
vi.mock('../storage');

describe('Profile Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadProfilePicture', () => {
    it('should reject unauthenticated users', async () => {
      const procedure = profileRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        procedure.uploadProfilePicture({
          imageData: 'base64data',
          fileName: 'test.jpg',
          mimeType: 'image/jpeg',
        })
      ).rejects.toThrow('User not authenticated');
    });

    it('should validate file size limit', async () => {
      const largeBase64 = 'a'.repeat(6 * 1024 * 1024); // 6MB in base64

      const procedure = profileRouter.createCaller({
        user: { id: 1, email: 'test@example.com' } as any,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        procedure.uploadProfilePicture({
          imageData: largeBase64,
          fileName: 'large.jpg',
          mimeType: 'image/jpeg',
        })
      ).rejects.toThrow('File size exceeds 5MB limit');
    });

    it('should upload valid image and return URL', async () => {
      const mockUrl = 'https://s3.example.com/profile-pictures/1-123456-abc123.jpg';
      vi.mocked(storagePut).mockResolvedValueOnce({ url: mockUrl, key: 'profile-pictures/1-123456-abc123.jpg' });

      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce(undefined),
      };
      vi.mocked(getDb).mockResolvedValueOnce(mockDb as any);

      const procedure = profileRouter.createCaller({
        user: { id: 1, email: 'test@example.com' } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await procedure.uploadProfilePicture({
        imageData: Buffer.from('fake image data').toString('base64'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBe(mockUrl);
      expect(storagePut).toHaveBeenCalled();
    });
  });

  describe('getProfilePicture', () => {
    it('should reject unauthenticated users', async () => {
      const procedure = profileRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(procedure.getProfilePicture()).rejects.toThrow('User not authenticated');
    });

    it('should return profile picture URL if exists', async () => {
      const mockUrl = 'https://s3.example.com/profile-pictures/1-123456-abc123.jpg';
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValueOnce({ profilePictureUrl: mockUrl }),
      };
      vi.mocked(getDb).mockResolvedValueOnce(mockDb as any);

      const procedure = profileRouter.createCaller({
        user: { id: 1, email: 'test@example.com' } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await procedure.getProfilePicture();

      expect(result.profilePictureUrl).toBe(mockUrl);
      expect(result.hasProfilePicture).toBe(true);
    });

    it('should return null if no profile picture', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValueOnce({ profilePictureUrl: null }),
      };
      vi.mocked(getDb).mockResolvedValueOnce(mockDb as any);

      const procedure = profileRouter.createCaller({
        user: { id: 1, email: 'test@example.com' } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await procedure.getProfilePicture();

      expect(result.profilePictureUrl).toBeNull();
      expect(result.hasProfilePicture).toBe(false);
    });
  });

  describe('deleteProfilePicture', () => {
    it('should reject unauthenticated users', async () => {
      const procedure = profileRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(procedure.deleteProfilePicture()).rejects.toThrow('User not authenticated');
    });

    it('should delete profile picture successfully', async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce(undefined),
      };
      vi.mocked(getDb).mockResolvedValueOnce(mockDb as any);

      const procedure = profileRouter.createCaller({
        user: { id: 1, email: 'test@example.com' } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await procedure.deleteProfilePicture();

      expect(result.success).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
