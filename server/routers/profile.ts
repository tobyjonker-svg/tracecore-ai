import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { eq } from "drizzle-orm";

export const profileRouter = router({
  /**
   * Upload profile picture
   * Accepts base64 encoded image data
   * Returns the S3 URL of the uploaded image
   */
  uploadProfilePicture: protectedProcedure
    .input(
      z.object({
        imageData: z.string().describe("Base64 encoded image data"),
        fileName: z.string().describe("Original file name"),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).describe("MIME type of the image"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.imageData, "base64");

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (buffer.length > MAX_SIZE) {
          throw new Error("File size exceeds 5MB limit");
        }

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `profile-pictures/${userId}-${timestamp}-${randomSuffix}.jpg`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Update user profile picture URL in database
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        await database
          .update(users)
          .set({
            profilePictureUrl: url,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          url,
          message: "Profile picture uploaded successfully",
        };
      } catch (error) {
        console.error("Profile picture upload error:", error);
        throw new Error(`Failed to upload profile picture: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get current user's profile picture URL
   */
  getProfilePicture: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new Error("User not authenticated");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");
      
      const user = await database
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then(rows => rows[0]);

      return {
        profilePictureUrl: user?.profilePictureUrl || null,
        hasProfilePicture: !!user?.profilePictureUrl,
      };
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      throw new Error("Failed to fetch profile picture");
    }
  }),

  /**
   * Delete profile picture
   */
  deleteProfilePicture: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new Error("User not authenticated");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");
      
      await database
        .update(users)
        .set({
          profilePictureUrl: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        message: "Profile picture deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      throw new Error("Failed to delete profile picture");
    }
  }),
});
