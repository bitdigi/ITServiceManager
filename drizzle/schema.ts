import { boolean, double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Shared service tickets. The app-generated ticket ID is intentionally used as
 * the primary key so every device refers to exactly the same ticket.
 *
 * Dates remain ISO 8601 strings to match the offline AsyncStorage model and
 * avoid timezone conversion while synchronizing between Android devices.
 */
export const serviceTickets = mysqlTable("serviceTickets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 64 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  productType: varchar("productType", { length: 32 }).notNull(),
  productModel: varchar("productModel", { length: 255 }).notNull(),
  productSerialNumber: varchar("productSerialNumber", { length: 255 }).notNull(),
  problemDescription: text("problemDescription").notNull(),
  diagnostic: text("diagnostic").notNull(),
  solutionApplied: text("solutionApplied").notNull(),
  cost: double("cost").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  technicianName: varchar("technicianName", { length: 255 }).notNull(),
  dateReceived: varchar("dateReceived", { length: 40 }).notNull(),
  dateDelivered: varchar("dateDelivered", { length: 40 }),
  telegramSent: boolean("telegramSent").default(false).notNull(),
  telegramMessageId: varchar("telegramMessageId", { length: 64 }),
  createdAt: varchar("createdAt", { length: 40 }).notNull(),
  updatedAt: varchar("updatedAt", { length: 40 }).notNull(),
  /** Tombstones let a deletion made on one phone remove the ticket on every other phone. */
  deletedAt: varchar("deletedAt", { length: 40 }),
});

export type ServiceTicketRecord = typeof serviceTickets.$inferSelect;
export type InsertServiceTicketRecord = typeof serviceTickets.$inferInsert;
