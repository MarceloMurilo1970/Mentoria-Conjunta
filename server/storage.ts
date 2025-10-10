import { type Registration, type InsertRegistration, registrations } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
}

export class DbStorage implements IStorage {
  async getRegistration(id: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    return result[0];
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
    return result[0];
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const result = await db.insert(registrations).values(insertRegistration).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
