import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertServiceTicketRecord,
  InsertUser,
  serviceTickets,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Return active tickets and deletion tombstones, newest changes first. */
export async function getAllServiceTickets() {
  const db = await getDb();
  if (!db) throw new Error("Baza de date pentru sincronizare nu este disponibilă");

  return db.select().from(serviceTickets).orderBy(desc(serviceTickets.updatedAt));
}

/**
 * Last-write-wins upsert based on the ISO update timestamp produced by the app.
 * This protects a recently updated or deleted record from being overwritten by a
 * stale offline copy pushed by another phone.
 */
export async function upsertServiceTicket(ticket: InsertServiceTicketRecord) {
  const db = await getDb();
  if (!db) throw new Error("Baza de date pentru sincronizare nu este disponibilă");

  const existing = await db.select().from(serviceTickets).where(eq(serviceTickets.id, ticket.id)).limit(1);
  if (existing[0] && existing[0].updatedAt > ticket.updatedAt) {
    return { applied: false, ticket: existing[0] };
  }

  if (!existing[0]) {
    await db.insert(serviceTickets).values(ticket);
    return { applied: true, ticket };
  }

  // Preserve the timestamp at which the ticket was originally created.
  const values = { ...ticket, createdAt: existing[0].createdAt };
  await db.update(serviceTickets).set(values).where(eq(serviceTickets.id, ticket.id));
  return { applied: true, ticket: values };
}

/** Mark a record as deleted instead of removing it, so other devices receive the deletion. */
export async function deleteServiceTicket(id: string, updatedAt: string) {
  const db = await getDb();
  if (!db) throw new Error("Baza de date pentru sincronizare nu este disponibilă");

  const existing = await db.select().from(serviceTickets).where(eq(serviceTickets.id, id)).limit(1);
  if (!existing[0]) return { applied: false, reason: "not_found" as const };
  if (existing[0].updatedAt > updatedAt) return { applied: false, reason: "stale" as const };

  await db
    .update(serviceTickets)
    .set({ deletedAt: updatedAt, updatedAt })
    .where(eq(serviceTickets.id, id));
  return { applied: true, reason: "deleted" as const };
}
