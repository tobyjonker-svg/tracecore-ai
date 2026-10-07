// Auth stub - Manus OAuth removed, using session-based auth
export const sdk = {
  authenticateRequest: async (req: any) => {
    return null; // Session auth handled in context.ts
  },
  createSessionToken: async (openId: string, payload: any) => {
    return "stub-token";
  },
};
