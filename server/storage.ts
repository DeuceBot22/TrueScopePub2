import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  entities,
  type User,
  type InsertUser,
} from "@shared/schema";

export type InsertEntity = {
  type: string; // Person | Organization | Place | Document | Media
  name: string;
  aliases?: string[];
  tags?: string[];
  notes?: string | null;
};

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Entities (V0)
  listEntities(userId: string): Promise<any[]>;
  createEntity(userId: string, data: InsertEntity): Promise<any>;
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
}

export const storage = new DbStorage();
