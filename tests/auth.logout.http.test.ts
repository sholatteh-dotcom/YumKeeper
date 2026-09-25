import { afterEach, describe, expect, it } from "vitest";
import express from "express";
import type { Server } from "node:http";

import { registerOAuthRoutes } from "../server/_core/oauth";
import { COOKIE_NAME } from "../shared/const";

let server: Server | undefined;

async function startOAuthTestServer() {
  const app = express();
  registerOAuthRoutes(app);

  server = await new Promise<Server>((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("OAuth test server did not receive a TCP address");
  }

  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  if (!server) return;

  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie and reports success over HTTP", async () => {
    const baseUrl = await startOAuthTestServer();

    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `${COOKIE_NAME}=session-token`,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });

    const clearedCookie = response.headers.get("set-cookie") ?? "";
    expect(clearedCookie).toContain(`${COOKIE_NAME}=;`);
    expect(clearedCookie).toContain("Max-Age=-1");
    expect(clearedCookie).toContain("Path=/");
    expect(clearedCookie).toContain("HttpOnly");
    expect(clearedCookie).toContain("SameSite=None");
    expect(clearedCookie).not.toContain("Domain=");
  });
});
