import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Request } from "express";
import type { Server } from "node:http";

import {
  buildSessionUserResponse,
  registerSessionRoutes,
  type SessionUser,
} from "../server/_core/session-routes";
import { COOKIE_NAME } from "../shared/const";

const authenticatedUser: SessionUser = {
  id: 42,
  openId: "yumkeeper-user",
  name: "Yum Keeper",
  email: "keeper@example.com",
  loginMethod: "manus",
  lastSignedIn: new Date("2026-09-25T00:00:00.000Z"),
};

let server: Server | undefined;
let authenticateRequest: ReturnType<typeof vi.fn>;
let consoleError: ReturnType<typeof vi.spyOn>;

async function startSessionTestServer() {
  const app = express();
  registerSessionRoutes(app, { authenticateRequest });

  server = await new Promise<Server>((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Session test server did not receive a TCP address");
  }

  return `http://127.0.0.1:${address.port}`;
}

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  authenticateRequest = vi.fn(async (req: Request) => {
    const authorization = req.headers.authorization;
    const cookie = req.headers.cookie ?? "";
    if (authorization === "Bearer session-token" || cookie.includes(`${COOKIE_NAME}=session-token`)) {
      return authenticatedUser;
    }
    throw new Error("Invalid session");
  });
});

afterEach(async () => {
  consoleError.mockRestore();
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("session lifecycle HTTP routes", () => {
  it("normalizes missing profile fields to null", () => {
    const response = buildSessionUserResponse({});

    expect(response).toMatchObject({
      id: null,
      openId: null,
      name: null,
      email: null,
      loginMethod: null,
    });
    expect(response.lastSignedIn).toEqual(expect.any(String));
  });

  it("establishes a session, reads the authenticated profile, and logs out", async () => {
    const baseUrl = await startSessionTestServer();

    const establishResponse = await fetch(`${baseUrl}/api/auth/session`, {
      method: "POST",
      headers: { Authorization: "Bearer session-token" },
    });
    expect(establishResponse.status).toBe(200);
    await expect(establishResponse.json()).resolves.toEqual({
      success: true,
      user: {
        ...authenticatedUser,
        lastSignedIn: "2026-09-25T00:00:00.000Z",
      },
    });

    const setCookie = establishResponse.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${COOKIE_NAME}=session-token`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=None");

    const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `${COOKIE_NAME}=session-token` },
    });
    expect(profileResponse.status).toBe(200);
    await expect(profileResponse.json()).resolves.toEqual({
      user: {
        ...authenticatedUser,
        lastSignedIn: "2026-09-25T00:00:00.000Z",
      },
    });

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: `${COOKIE_NAME}=session-token` },
    });
    expect(logoutResponse.status).toBe(200);
    await expect(logoutResponse.json()).resolves.toEqual({ success: true });
    expect(logoutResponse.headers.get("set-cookie")).toContain(`${COOKIE_NAME}=;`);
  });

  it("rejects unauthenticated profile and session requests", async () => {
    const baseUrl = await startSessionTestServer();

    const profileResponse = await fetch(`${baseUrl}/api/auth/me`);
    expect(profileResponse.status).toBe(401);
    await expect(profileResponse.json()).resolves.toEqual({
      error: "Not authenticated",
      user: null,
    });

    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, { method: "POST" });
    expect(sessionResponse.status).toBe(401);
    await expect(sessionResponse.json()).resolves.toEqual({ error: "Invalid token" });
  });

  it("requires a bearer header after authentication succeeds", async () => {
    authenticateRequest.mockResolvedValueOnce(authenticatedUser);
    const baseUrl = await startSessionTestServer();

    const response = await fetch(`${baseUrl}/api/auth/session`, { method: "POST" });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Bearer token required" });
  });
});
