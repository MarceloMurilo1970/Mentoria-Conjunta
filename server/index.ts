import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import pgSession from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensureConnection } from "./db";
import { pool } from "./db";

const app = express();

// Trust proxy for production (behind reverse proxy/load balancer)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Health check endpoint - responds immediately before any other routes
// This ensures deployment health checks pass quickly
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration - use PostgreSQL in production for persistence
const MemoryStore = createMemoryStore(session);
const PgStore = pgSession(session);

const sessionStore = process.env.NODE_ENV === "production" && process.env.DATABASE_URL
  ? new PgStore({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    })
  : new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mentorship-crm-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Ensure database connection with retry logic for Neon cold starts
    log('Connecting to database...');
    const connected = await ensureConnection();
    if (!connected) {
      log('Warning: Could not establish initial database connection, will retry on first query');
    }
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Fatal startup error: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Startup error:', error);
    // Don't exit - let the health check still work
  }
})();
