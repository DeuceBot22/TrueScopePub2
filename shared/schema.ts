import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * USERS
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/**
 * ENTITIES
 */
export const entities = pgTable("entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // Person | Organization | Place | Document | Media
  name: text("name").notNull(),
  aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEntitySchema = createInsertSchema(entities).pick({
  type: true,
  name: true,
  aliases: true,
  tags: true,
  notes: true,
});

/**
 * EVIDENCE
 * V0: store URL evidence + basic file metadata (we’ll wire actual file upload next)
 */
export const evidenceItems = pgTable("evidence_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  kind: text("kind").notNull(), // pdf | text | image | audio | video | url
  url: text("url"),
  sourceName: text("source_name"),
  publishedDate: text("published_date"),
  reliabilityScore: integer("reliability_score").notNull().default(3), // 1..5
  notes: text("notes"),
  // for later file upload support
  storageKey: text("storage_key"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  sha256: text("sha256"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidenceItems).pick({
  title: true,
  kind: true,
  url: true,
  sourceName: true,
  publishedDate: true,
  reliabilityScore: true,
  notes: true,
  storageKey: true,
  mimeType: true,
  sizeBytes: true,
  sha256: true,
});

/**
 * EVENTS
 */
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  dateStart: text("date_start").notNull(), // ISO date string
  dateEnd: text("date_end"), // optional
  locationEntityId: varchar("location_entity_id").references(() => entities.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * EVENT PARTICIPANTS (many-to-many)
 */
export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  entityId: varchar("entity_id").notNull().references(() => entities.id),
});

/**
 * CLAIMS
 */
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // funding/affiliation/...
  sourceId: varchar("source_id").notNull().references(() => entities.id),
  targetId: varchar("target_id").notNull().references(() => entities.id),
  directed: boolean("directed").notNull().default(true),
  statement: text("statement").notNull(),
  dateStart: text("date_start"),
  dateEnd: text("date_end"),
  confidenceScore: integer("confidence_score").notNull().default(3), // 1..5
  humanReviewed: boolean("human_reviewed").notNull().default(false),
  disputed: boolean("disputed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * CLAIM <-> EVIDENCE links
 */
export const claimEvidence = pgTable("claim_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => claims.id),
  evidenceId: varchar("evidence_id").notNull().references(() => evidenceItems.id),
});

/**
 * ENTITY <-> EVIDENCE links
 */
export const entityEvidence = pgTable("entity_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: varchar("entity_id").notNull().references(() => entities.id),
  evidenceId: varchar("evidence_id").notNull().references(() => evidenceItems.id),
});

/**
 * EVENT <-> EVIDENCE links
 */
export const eventEvidence = pgTable("event_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  evidenceId: varchar("evidence_id").notNull().references(() => evidenceItems.id),
});

export const insertClaimSchema = createInsertSchema(claims).pick({
  type: true,
  sourceId: true,
  targetId: true,
  directed: true,
  statement: true,
  dateStart: true,
  dateEnd: true,
  confidenceScore: true,
  humanReviewed: true,
  disputed: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  dateStart: true,
  dateEnd: true,
  locationEntityId: true,
  notes: true,
});
