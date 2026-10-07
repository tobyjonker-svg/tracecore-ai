import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import https from "https";

// WhatsApp notification to Toby on new signup
async function notifyNewSignup(name: string, email: string, plan: string) {
  try {
    const msg = encodeURIComponent(
      `🎉 New TraceCore AI signup!\n\nName: ${name}\nEmail: ${email}\nPlan: ${plan}\nTime: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}\n\nLog in to admin: https://tracecoreai.co.za/app/admin`
    );
    const url = `https://api.callmebot.com/whatsapp.php?phone=27665794855&text=${msg}&apikey=YOUR_CALLMEBOT_KEY`;
    // Fire and forget
    https.get(url, () => {}).on('error', () => {});
  } catch (e) {
    // Non-critical
  }
}

export const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user ?? null;
  }),

  register: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      plan: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await db.createUser({ name: input.name, email: input.email, passwordHash });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      
      // Set trial end date (7 days from now)
      await db.setUserTrial(user.id);

      // Detect currency from IP
      try {
        const ip = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0] || ctx.req.socket.remoteAddress || '';
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
        const geo = await geoRes.json() as any;
        const currency = geo.countryCode === 'ZA' ? 'ZAR' : 'USD';
        await db.setUserCurrency(user.id, currency);
      } catch(e) { /* default ZAR */ }
      
      // Create workspace
      await db.createWorkspace(user.id, `${input.name}'s Workspace`);
      
      // Set session
      (ctx.req as any).session.userId = user.id;
      
      // Notify Toby via WhatsApp
      notifyNewSignup(input.name, input.email, input.plan || 'Trial');
      
      console.log(`[Auth] New user registered: ${input.email}`);
      return { success: true, user };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      if (!user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      
      // Check trial status
      if (user.subscriptionStatus === 'expired') {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Your trial has expired. Please contact hello@tracecoreai.co.za to subscribe." 
        });
      }
      
      (ctx.req as any).session.userId = user.id;
      console.log(`[Auth] User logged in: ${input.email}`);
      return { success: true, user };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await new Promise<void>((resolve) => {
      (ctx.req as any).session.destroy(() => resolve());
    });
    return { success: true };
  }),
});
