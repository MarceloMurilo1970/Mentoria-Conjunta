import { type Registration, type InsertRegistration, registrations, type PageView, type InsertPageView, pageViews } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte } from "drizzle-orm";

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

export interface InvoiceUpdate {
  invoiceIssued: boolean;
  invoiceIssuedAt: Date | null;
  invoices?: string | null;
}

export interface VendorCommissionUpdate {
  vendorCommissionPaid: number;
  vendorCommissionPaidAt: Date | null;
}

export interface BatchUpdate {
  batch: number;
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
  updateInvoice(id: string, update: InvoiceUpdate): Promise<Registration | undefined>;
  updateVendorCommission(id: string, update: VendorCommissionUpdate): Promise<Registration | undefined>;
  updateBatch(id: string, update: BatchUpdate): Promise<Registration | undefined>;
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

  async updateInvoice(id: string, update: InvoiceUpdate): Promise<Registration | undefined> {
    const updateData: any = { 
      invoiceIssued: update.invoiceIssued,
      invoiceIssuedAt: update.invoiceIssuedAt
    };
    if (update.invoices !== undefined) {
      updateData.invoices = update.invoices;
    }
    const result = await db.update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async updateVendorCommission(id: string, update: VendorCommissionUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ 
        vendorCommissionPaid: update.vendorCommissionPaid,
        vendorCommissionPaidAt: update.vendorCommissionPaidAt
      })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async updateBatch(id: string, update: BatchUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ batch: update.batch })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  // Page Views Analytics
  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const result = await db.insert(pageViews).values(pageView).returning();
    return result[0];
  }

  async getPageViewsByDay(days: number = 30): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') as date,
        COUNT(*)::integer as count
      FROM page_views 
      WHERE created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
      ORDER BY date DESC
    `);
    return result.rows as { date: string; count: number }[];
  }

  async getPageViewsByPath(days: number = 30): Promise<{ path: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db.execute(sql`
      SELECT 
        path,
        COUNT(*)::integer as count
      FROM page_views 
      WHERE created_at >= ${startDate}
      GROUP BY path
      ORDER BY count DESC
    `);
    return result.rows as { path: string; count: number }[];
  }

  async getTotalPageViews(): Promise<number> {
    const result = await db.execute(sql`SELECT COUNT(*)::integer as count FROM page_views`);
    return (result.rows[0] as { count: number }).count;
  }

  async getUniqueVisitors(days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db.execute(sql`
      SELECT COUNT(DISTINCT session_id)::integer as count 
      FROM page_views 
      WHERE created_at >= ${startDate} AND session_id IS NOT NULL
    `);
    return (result.rows[0] as { count: number }).count;
  }
}

export const storage = new DbStorage();
