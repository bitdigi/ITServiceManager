import { COOKIE_NAME } from "../shared/const.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const syncTokenSchema = z.string().min(20).max(256);

const ticketSchema = z.object({
  id: z.string().min(1).max(64),
  clientName: z.string().max(255),
  clientPhone: z.string().max(64),
  clientEmail: z.string().max(320),
  productType: z.enum(["laptop", "pc", "phone", "printer", "gps", "tv", "box", "tablet"]),
  productModel: z.string().max(255),
  productSerialNumber: z.string().max(255),
  problemDescription: z.string().max(10000),
  diagnostic: z.string().max(10000),
  solutionApplied: z.string().max(10000),
  cost: z.number().finite().min(0),
  status: z.enum(["pending", "in_progress", "completed", "on_hold"]),
  technicianName: z.string().max(255),
  dateReceived: z.string().datetime(),
  dateDelivered: z.string().datetime().nullable(),
  telegramSent: z.boolean(),
  telegramMessageId: z.string().max(64).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

/**
 * The bot token is already configured on each authorized technician device.
 * Requiring it here keeps the public tRPC endpoints from exposing client data
 * to callers that only know the server URL, without placing any token in code.
 */
function assertSyncAccess(syncToken: string) {
  const expectedToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!expectedToken || syncToken !== expectedToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Cheie de sincronizare nevalidă" });
  }
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  tickets: router({
    list: publicProcedure.input(z.object({ syncToken: syncTokenSchema })).query(async ({ input }) => {
      assertSyncAccess(input.syncToken);
      return db.getAllServiceTickets();
    }),
    upsert: publicProcedure
      .input(ticketSchema.extend({ syncToken: syncTokenSchema }))
      .mutation(async ({ input }) => {
        assertSyncAccess(input.syncToken);
        const { syncToken: _syncToken, deletedAt = null, ...ticket } = input;
        return db.upsertServiceTicket({ ...ticket, deletedAt });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string().min(1).max(64), updatedAt: z.string().datetime(), syncToken: syncTokenSchema }))
      .mutation(async ({ input }) => {
        assertSyncAccess(input.syncToken);
        return db.deleteServiceTicket(input.id, input.updatedAt);
      }),
  }),
});

export type AppRouter = typeof appRouter;
