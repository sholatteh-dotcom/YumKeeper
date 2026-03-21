import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
 * Subscriptions table — tracks Stripe subscription state per user.
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  stripePriceId: varchar("stripePriceId", { length: 64 }),
  tier: mysqlEnum("tier", ["free", "fresh", "family"]).default("free").notNull(),
  billingInterval: mysqlEnum("billingInterval", ["month", "year"]).default("month"),
  status: varchar("status", { length: 32 }).default("inactive").notNull(), // active, canceled, past_due, trialing, etc.
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Legal consent records table — stores an audit trail of when each user
 * explicitly agreed to the Terms of Service and Privacy Policy.
 * One record per user per policy version.
 */
export const consentRecords = mysqlTable("consent_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  policyVersion: varchar("policyVersion", { length: 16 }).notNull().default("1.0"),
  consentedAt: timestamp("consentedAt").notNull(),
  documents: varchar("documents", { length: 255 }).notNull().default("terms-of-service,privacy-policy"),
  platform: varchar("platform", { length: 16 }), // 'ios' | 'android' | 'web'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = typeof consentRecords.$inferInsert;

/**
 * GDPR Article 17 erasure requests. Stores a log of user-initiated data
 * deletion requests. Requests are processed within 30 days per the privacy policy.
 */
export const deletionRequests = mysqlTable("deletion_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "cancelled"]).default("pending").notNull(),
  completedAt: timestamp("completed_at"),
  notes: varchar("notes", { length: 500 }),
});

export type DeletionRequest = typeof deletionRequests.$inferSelect;
export type InsertDeletionRequest = typeof deletionRequests.$inferInsert;
