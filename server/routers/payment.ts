/**
 * Payment Router - tRPC procedures for payment handling
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { sendPaymentDetailsEmail } from "../email";
import { TIER_CONFIG } from "../../shared/tiers";

export const paymentRouter = router({
  sendPaymentEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        tier: z.enum(["pro", "pro_plus"]),
        reference: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const tierConfig = TIER_CONFIG[input.tier];

      const success = await sendPaymentDetailsEmail({
        email: input.email,
        tier: input.tier,
        tierName: tierConfig.name,
        amount: tierConfig.monthlyPrice,
        reference: input.reference,
        bankDetails: {
          accountHolder: "T Jonker",
          accountNumber: "63198166035",
          bankName: "First National Bank",
          accountType: "Savings Account",
          branchCode: "250155",
        },
      });

      if (!success) {
        throw new Error("Failed to send email");
      }

      return {
        success: true,
        message: "Payment details sent to your email",
      };
    }),
});
