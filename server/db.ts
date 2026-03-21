import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, InsertSubscription, Subscription, consentRecords, InsertConsentRecord, ConsentRecord, deletionRequests, InsertDeletionRequest, DeletionRequest } from "../drizzle/schema";
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

// ─── Subscription helpers ────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscriptionByStripeCustomerId(customerId: string): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSubscription(data: InsertSubscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, data.userId)).limit(1);
  if (existing.length > 0) {
    await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.userId, data.userId));
  } else {
    await db.insert(subscriptions).values(data);
  }
}

// ─── Consent record helpers ─────────────────────────────────────────────────

/**
 * Upserts a legal consent record for a user.
 * If the user has already consented to this policy version, this is a no-op.
 */
export async function upsertConsentRecord(data: InsertConsentRecord): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save consent record: database not available");
    return;
  }
  const existing = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.userId, data.userId))
    .limit(1);
  if (existing.length > 0 && existing[0].policyVersion === data.policyVersion) return; // Already recorded for this version
  await db.insert(consentRecords).values(data);
}

/**
 * Returns a summary of consent status for all users against a given policy version.
 * Used by the admin panel to identify users who have not yet consented.
 */
export async function getConsentStatusSummary(policyVersion: string): Promise<{
  totalUsers: number;
  consentedCount: number;
  pendingCount: number;
  pendingUsers: Array<{ userId: number; email: string | null; name: string | null; lastConsentedVersion: string | null }>;
}> {
  const db = await getDb();
  if (!db) {
    return { totalUsers: 0, consentedCount: 0, pendingCount: 0, pendingUsers: [] };
  }

  // Get all users
  const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);

  // Get all consent records for this policy version
  const consentedRecords = await db
    .select({ userId: consentRecords.userId })
    .from(consentRecords)
    .where(eq(consentRecords.policyVersion, policyVersion));

  const consentedUserIds = new Set(consentedRecords.map((r) => r.userId));

  // Get latest consent version for non-consented users
  const pendingUsers = await Promise.all(
    allUsers
      .filter((u) => !consentedUserIds.has(u.id))
      .map(async (u) => {
        const latest = await getLatestConsentRecord(u.id);
        return {
          userId: u.id,
          email: u.email ?? null,
          name: u.name ?? null,
          lastConsentedVersion: latest?.policyVersion ?? null,
        };
      }),
  );

  return {
    totalUsers: allUsers.length,
    consentedCount: consentedUserIds.size,
    pendingCount: pendingUsers.length,
    pendingUsers,
  };
}

export async function getLatestConsentRecord(userId: number): Promise<ConsentRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscriptionByCustomerId(
  customerId: string,
  data: Partial<InsertSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.stripeCustomerId, customerId));
}

// ─── GDPR Deletion Requests ────────────────────────────────────────────────

/**
 * Creates a new GDPR Article 17 erasure request for a user.
 * Returns the inserted record ID, or null if DB is unavailable.
 */
export async function createDeletionRequest(userId: number, platform?: string): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create deletion request: database not available");
    return null;
  }
  // Check for an existing pending request to avoid duplicates
  const existing = await db
    .select({ id: deletionRequests.id })
    .from(deletionRequests)
    .where(eq(deletionRequests.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    return existing[0].id; // Return existing request id
  }
  const result = await db.insert(deletionRequests).values({
    userId,
    requestedAt: new Date(),
    status: "pending",
    notes: platform ? `Requested via ${platform}` : null,
  });
  return (result as unknown as { insertId: number }).insertId ?? null;
}

/**
 * Returns the latest deletion request for a user, or null if none exists.
 */
export async function getDeletionRequest(userId: number): Promise<DeletionRequest | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(deletionRequests)
    .where(eq(deletionRequests.userId, userId))
    .limit(1);
  return result[0] ?? null;
}
