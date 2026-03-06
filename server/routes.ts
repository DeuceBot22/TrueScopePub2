import type { Express, Request, Response } from "express";
import type { Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { pool } from "./db";
import { insertUserSchema, insertEntitySchema } from "@shared/schema";

const PgSession = connectPgSimple(session);

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // --- Sessions (stored in Postgres) ---
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "truescope-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }),
  );

  // --- Passport Local ---
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid credentials" });

        const hashed = hashPassword(password);
        if (user.password !== hashed) return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // --- Auth routes ---
  app.post("/api/register", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const { username, password } = parsed.data;
    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(409).json({ message: "Username already exists" });

    const user = await storage.createUser({ username, password: hashPassword(password) });

    // auto-login after register
    req.login(user as any, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      return res.json({ id: user.id, username: user.username });
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.json({ id: user.id, username: user.username });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/me", (req, res) => {
    if (!req.user) return res.json(null);
    const u = req.user as any;
    res.json({ id: u.id, username: u.username });
  });

  // --- Entities routes ---
  app.get("/api/entities", requireAuth, async (req, res) => {
    const userId = (req.user as any).id as string;
    const rows = await storage.listEntities(userId);
    res.json(rows);
  });

  app.post("/api/entities", requireAuth, async (req, res) => {
    const userId = (req.user as any).id as string;

    const parsed = insertEntitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const created = await storage.createEntity(userId, parsed.data);
    res.json(created);
  });

  return httpServer;
}
