import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";

import {
  registerPublicDeletionRequestRoute,
  type PublicDeletionRequestDependencies,
} from "../server/_core/public-deletion-request";

let server: Server | undefined;
let dependencies: {
  [K in keyof PublicDeletionRequestDependencies]: ReturnType<typeof vi.fn>;
};

async function startDeletionRequestServer() {
  const app = express();
  app.use(express.json());
  registerPublicDeletionRequestRoute(app, dependencies);

  server = await new Promise<Server>((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Deletion request server did not bind to TCP");
  return `http://127.0.0.1:${address.port}`;
}

beforeEach(() => {
  dependencies = {
    recordRequest: vi.fn().mockResolvedValue(undefined),
    notifyOwner: vi.fn().mockResolvedValue(true),
  };
});

afterEach(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("public deletion-request notification integration", () => {
  it("validates the email address before writing data or notifying the owner", async () => {
    const baseUrl = await startDeletionRequestServer();
    const response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Valid email required" });
    expect(dependencies.recordRequest).not.toHaveBeenCalled();
    expect(dependencies.notifyOwner).not.toHaveBeenCalled();
  });

  it("records a trimmed request and delivers its owner notification", async () => {
    const baseUrl = await startDeletionRequestServer();
    const response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "  privacy@example.com  ",
        reason: "  I no longer use the app  ",
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(dependencies.recordRequest).toHaveBeenCalledWith({
      email: "privacy@example.com",
      reason: "I no longer use the app",
    });
    expect(dependencies.notifyOwner).toHaveBeenCalledWith({
      title: "New deletion request (web form)",
      content: "Email: privacy@example.com\nReason: I no longer use the app",
    });
  });

  it("uses a clear default reason and returns a safe error when persistence or notification fails", async () => {
    const baseUrl = await startDeletionRequestServer();
    let response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "privacy@example.com", reason: "   " }),
    });
    expect(response.status).toBe(200);
    expect(dependencies.notifyOwner).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: "Email: privacy@example.com\nReason: not provided" }),
    );

    dependencies.recordRequest.mockRejectedValueOnce(new Error("database unavailable"));
    response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "privacy@example.com" }),
    });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Internal server error" });

    dependencies.notifyOwner.mockRejectedValueOnce(new Error("notification unavailable"));
    response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "privacy@example.com" }),
    });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Internal server error" });
  });
});
