import type { Express, Request } from "express";

import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import { getSessionCookieOptions } from "./cookies";

export type SessionUser = {
  id?: number | null;
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date | null;
};

export type SessionRouteDependencies = {
  authenticateRequest: (req: Request) => Promise<SessionUser>;
};

export function buildSessionUserResponse(user: SessionUser) {
  return {
    id: user.id ?? null,
    openId: user.openId ?? null,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    lastSignedIn: (user.lastSignedIn ?? new Date()).toISOString(),
  };
}

/**
 * Registers the browser and native session lifecycle endpoints. Authentication
 * is injected so the HTTP behavior can be exercised without a live OAuth or DB
 * service, while production continues to use the shared SDK implementation.
 */
export function registerSessionRoutes(app: Express, { authenticateRequest }: SessionRouteDependencies) {
  app.post("/api/auth/logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      res.json({ user: buildSessionUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/me failed:", error);
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });

  app.post("/api/auth/session", async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }

      const token = authHeader.slice("Bearer ".length).trim();
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: buildSessionUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
