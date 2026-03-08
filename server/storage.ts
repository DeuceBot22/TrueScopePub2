import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  entities,
  evidenceItems,
  events,
  eventParticipants,
  claims,
  type User,
  type InsertUser,
} from "@shared/schema";

export type InsertEntity = {
  type: string;
  name: string;
  aliases?: string[];
  tags?: string[];
  notes?: string | null;
};

export type InsertEvidence = {
  title: string;
  kind: string;
  url?: string | null;
  sourceName?: string | null;
  publishedDate?: string | null;
  reliabilityScore?: number | null;
  notes?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  sha256?: string | null;
};

export type InsertEvent = {
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  locationEntityId?: string | null;
  notes?: string | null;
  participantIds?: string[];
};

export type InsertClaim = {
  type: string;
  sourceId: string;
  targetId: string;
  directed?: boolean;
  statement: string;
  dateStart?: string | null;
  dateEnd?: string | null;
  confidenceScore?: number | null;
  humanReviewed?: boolean;
  disputed?: boolean;
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  listEntities(userId: string): Promise<any[]>;
  createEntity(userId: string, data: InsertEntity): Promise<any>;

  listEvidence(userId: string): Promise<any[]>;
  createEvidence(userId: string, data: InsertEvidence): Promise<any>;

  listEvents(userId: string): Promise<any[]>;
  createEvent(userId: string, data: InsertEvent): Promise<any>;

  listClaims(userId: string): Promise<any[]>;
  createClaim(userId: string, data: InsertClaim): Promise<any>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const rows = await db.insert(users).values(insertUser).returning();
    return rows[0];
  }

  async listEntities(userId: string): Promise<any[]> {
    return db.select().from(entities).where(eq(entities.userId, userId));
  }

  async createEntity(userId: string, data: InsertEntity): Promise<any> {
    const rows = await db
      .insert(entities)
      .values({
        userId,
        type: data.type,
        name: data.name,
        aliases: data.aliases ?? [],
        tags: data.tags ?? [],
        notes: data.notes ?? null,
      })
      .returning();
    return rows[0];
  }

  async listEvidence(userId: string): Promise<any[]> {
    return db.select().from(evidenceItems).where(eq(evidenceItems.userId, userId));
  }

  async createEvidence(userId: string, data: InsertEvidence): Promise<any> {
    const rows = await db
      .insert(evidenceItems)
      .values({
        userId,
        title: data.title,
        kind: data.kind,
        url: data.url ?? null,
        sourceName: data.sourceName ?? null,
        publishedDate: data.publishedDate ?? null,
        reliabilityScore: data.reliabilityScore ?? 3,
        notes: data.notes ?? null,
        storageKey: data.storageKey ?? null,
        mimeType: data.mimeType ?? null,
        sizeBytes: data.sizeBytes ?? null,
        sha256: data.sha256 ?? null,
      })
      .returning();
    return rows[0];
  }

  async listEvents(userId: string): Promise<any[]> {
    const rows = await db.select().from(events).where(eq(events.userId, userId));

    const out = [];
    for (const event of rows) {
      const participants = await db
        .select()
        .from(eventParticipants)
        .where(eq(eventParticipants.eventId, event.id));

      out.push({
        ...event,
        participantIds: participants.map((p) => p.entityId),
      });
    }

    return out;
  }

  async createEvent(userId: string, data: InsertEvent): Promise<any> {
    const rows = await db
      .insert(events)
      .values({
        userId,
        title: data.title,
        dateStart: data.dateStart,
        dateEnd: data.dateEnd ?? null,
        locationEntityId: data.locationEntityId ?? null,
        notes: data.notes ?? null,
      })
      .returning();

    const event = rows[0];

    if (data.participantIds?.length) {
      await db.insert(eventParticipants).values(
        data.participantIds.map((entityId) => ({
          eventId: event.id,
          entityId,
        })),
      );
    }

    return {
      ...event,
      participantIds: data.participantIds ?? [],
    };
  }

  async listClaims(userId: string): Promise<any[]> {
    return db.select().from(claims).where(eq(claims.userId, userId));
  }

  async createClaim(userId: string, data: InsertClaim): Promise<any> {
    const rows = await db
      .insert(claims)
      .values({
        userId,
        type: data.type,
        sourceId: data.sourceId,
        targetId: data.targetId,
        directed: data.directed ?? true,
        statement: data.statement,
        dateStart: data.dateStart ?? null,
        dateEnd: data.dateEnd ?? null,
        confidenceScore: data.confidenceScore ?? 3,
        humanReviewed: data.humanReviewed ?? false,
        disputed: data.disputed ?? false,
      })
      .returning();

    return rows[0];
  }
}

export const storage = new DbStorage();
