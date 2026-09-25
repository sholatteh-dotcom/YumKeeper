import type { Express } from "express";

import { deletionRequests } from "../../drizzle/schema";
import { getDb } from "../db";
import { notifyOwner, type NotificationPayload } from "./notification";

export type PublicDeletionRequest = {
  email: string;
  reason?: string | null;
};

export type PublicDeletionRequestDependencies = {
  recordRequest: (request: PublicDeletionRequest) => Promise<void>;
  notifyOwner: (payload: NotificationPayload) => Promise<boolean>;
};

async function recordPublicDeletionRequest({ email, reason }: PublicDeletionRequest): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(deletionRequests).values({
    userId: null as unknown as number,
    requestedAt: new Date(),
    status: "pending",
    notes: `Web form submission — email: ${email}${reason ? `; reason: ${reason}` : ""}`,
  });
}

const productionDependencies: PublicDeletionRequestDependencies = {
  recordRequest: recordPublicDeletionRequest,
  notifyOwner,
};

/**
 * Serves unauthenticated GDPR deletion requests from the public account-deletion
 * form. Storage and owner notification are injected to make the compliance path
 * testable without a live database or notification service.
 */
export function registerPublicDeletionRequestRoute(
  app: Express,
  dependencies: PublicDeletionRequestDependencies = productionDependencies,
) {
  app.post("/api/delete-account", async (req, res) => {
    const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const email = rawEmail.trim();
    const rawReason = typeof req.body?.reason === "string" ? req.body.reason : undefined;
    const reason = rawReason?.trim() || null;

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Valid email required" });
      return;
    }

    try {
      await dependencies.recordRequest({ email, reason });
      await dependencies.notifyOwner({
        title: "New deletion request (web form)",
        content: `Email: ${email}\nReason: ${reason ?? "not provided"}`,
      });
      res.json({ ok: true });
    } catch (error) {
      console.error("[delete-account] request handling failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
