import { type Registration, type InsertRegistration, registrations } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface PaymentUpdate {
  paymentStatus: 'pendente' | 'pago' | 'parcial';
  paidAmount?: number;
  totalAmount?: number;
  remainingPaymentDate?: Date | null;
}

export interface VendorUpdate {
  vendor: string | null;
}

export interface ObservationsUpdate {
  observations: string | null;
}

export interface IStorage {
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(id: string): Promise<boolean>;
  updatePaymentReceived(id: string, received: boolean): Promise<Registration | undefined>;
  updatePaymentStatus(id: string, update: PaymentUpdate): Promise<Registration | undefined>;
  updateVendor(id: string, update: VendorUpdate): Promise<Registration | undefined>;
  updateObservations(id: string, update: ObservationsUpdate): Promise<Registration | undefined>;
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

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }

  async updatePaymentReceived(id: string, received: boolean): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ paymentReceived: received })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async updatePaymentStatus(id: string, update: PaymentUpdate): Promise<Registration | undefined> {
    const updateData: Partial<Registration> = {
      paymentStatus: update.paymentStatus,
      paymentReceived: update.paymentStatus === 'pago',
      paidAmount: update.paidAmount ?? 0,
      totalAmount: update.totalAmount ?? 8000,
      remainingPaymentDate: update.remainingPaymentDate ?? null,
    };

    const result = await db.update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async updateVendor(id: string, update: VendorUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ vendor: update.vendor })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async updateObservations(id: string, update: ObservationsUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ observations: update.observations })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
