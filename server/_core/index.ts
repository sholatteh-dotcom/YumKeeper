import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { purgeExpiredDeletionRequests } from "../db";
import { notifyOwner } from "./notification";

// ESM-safe __dirname equivalent (works in both dev/tsx and production esbuild output)
const __filename = typeof __dirname !== "undefined" ? "" : fileURLToPath(import.meta.url);
const __dirnameESM = typeof __dirname !== "undefined" ? __dirname : path.dirname(__filename);
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerStripeWebhook } from "../stripe-webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Register Stripe webhook BEFORE express.json() so raw body is available
  registerStripeWebhook(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // ─── Public legal pages ────────────────────────────────────────────────────
  // Served as plain HTML — no auth required.
  // Suitable for Google Play Store / Apple App Store privacy policy links.

  // Use process.cwd() as base — always resolves to project root in both dev and production
  const serverDir = path.join(process.cwd(), "server");

  // Serve shared legal UI assets (CSS + JS for cookie banner & language switcher)
  app.use("/api/legal-assets", express.static(path.join(serverDir, "legal-assets")));

  // ─── Public legal pages (served under /api/ so they reach Express in production) ───
  app.get("/api/privacy-policy", (_req, res) => {
    res.sendFile(path.join(serverDir, "privacy-policy.html"));
  });
  // Convenience redirect: /api/privacy → /api/privacy-policy
  app.get("/api/privacy", (_req, res) => {
    res.redirect(301, "/api/privacy-policy");
  });

  app.get("/api/terms", (_req, res) => {
    res.sendFile(path.join(serverDir, "terms.html"));
  });
  // Convenience redirect: /api/terms-of-service → /api/terms
  app.get("/api/terms-of-service", (_req, res) => {
    res.redirect(301, "/api/terms");
  });

  // ─── Promotional ad landing page ──────────────────────────────────────────
  app.get("/api/ad", (_req, res) => {
    res.sendFile(path.join(serverDir, "ad.html"));
  });
  // A/B variant
  app.get("/api/ad-b", (_req, res) => {
    res.sendFile(path.join(serverDir, "ad-b.html"));
  });
  // Convenience redirect: /api/download → /api/ad
  app.get("/api/download", (_req, res) => {
    res.redirect(301, "/api/ad");
  });

  // ─── Sitemap ──────────────────────────────────────────────────────────────
  app.get("/api/sitemap.xml", (_req, res) => {
    const base = "https://freshkeep-ctbgrbwn.manus.space";
    const today = new Date().toISOString().split("T")[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/api/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${base}/api/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${base}/api/ad</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/api/ad-b</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);

// ─── Daily GDPR Purge Job ──────────────────────────────────────────────────
// Runs once per day at 02:00 UTC. Processes all deletion requests older than
// 30 days that are still pending or processing, deletes server-side user data,
// and marks requests as completed. Non-blocking — errors are logged, not thrown.
function scheduleDailyPurge() {
  const runPurge = async () => {
    try {
      const count = await purgeExpiredDeletionRequests();
      if (count > 0) {
        console.log(`[Purge] Daily job completed: processed ${count} expired deletion request(s)`);
        notifyOwner({
          title: "Daily GDPR Purge Completed",
          content: `The automated daily purge job processed ${count} expired deletion request(s). User data has been erased from the database.`,
        }).catch(() => {});
      } else {
        console.log("[Purge] Daily job: no expired requests found");
      }
    } catch (err) {
      console.error("[Purge] Daily job failed:", err);
    }
  };

  // Calculate ms until next 02:00 UTC
  const scheduleNext = () => {
    const now = new Date();
    const next = new Date();
    next.setUTCHours(2, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1); // tomorrow
    const delay = next.getTime() - now.getTime();
    console.log(`[Purge] Next daily job scheduled in ${Math.round(delay / 1000 / 60)} minutes (at 02:00 UTC)`);
    setTimeout(async () => {
      await runPurge();
      scheduleNext(); // reschedule for the following day
    }, delay);
  };

  scheduleNext();
}

scheduleDailyPurge();
