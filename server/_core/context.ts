import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const session = (opts.req as any).session;
    if (session?.userId) {
      user = await db.getUserById(session.userId);
    }
  } catch (error) {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
