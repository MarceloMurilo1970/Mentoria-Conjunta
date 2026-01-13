import { 
  type Registration, type InsertRegistration, registrations, 
  type PageView, type InsertPageView, pageViews,
  type Vendor, type InsertVendor, vendors,
  type Lead, type InsertLead, leads,
  type LeadActivity, type InsertLeadActivity, leadActivities,
  type LeadFollowUp, type InsertLeadFollowUp, leadFollowUps,
  type User, type InsertUser, users,
  type VendorActivityLog, type InsertVendorActivityLog, vendorActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte, isNull, and, or, ilike } from "drizzle-orm";

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

export interface ManualRegistrationData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  razaoSocial?: string | null;
  paymentMethod: 'pix' | 'installments';
  paymentStatus: 'pendente' | 'parcial' | 'pago';
  totalAmount: number;
  paidAmount: number;
  observations?: string | null;
  vendor?: string | null;
  leadId?: string | null;
}

export interface IStorage {
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  createManualRegistration(data: ManualRegistrationData): Promise<Registration>;
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

  async createManualRegistration(data: ManualRegistrationData): Promise<Registration> {
    const result = await db.insert(registrations).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpfCnpj: data.cpfCnpj,
      razaoSocial: data.razaoSocial || null,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      paymentReceived: data.paymentStatus === 'pago',
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      vendor: data.vendor || null,
      observations: data.observations || null,
      batch: 3, // Current batch
    }).returning();
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
        TO_CHAR((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') as date,
        COUNT(*)::integer as count
      FROM page_views 
      WHERE created_at >= ${startDate}
      GROUP BY TO_CHAR((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
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

  // CRM: Vendors
  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    return result[0];
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.email, email)).limit(1);
    return result[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  async updateVendorActive(id: string, isActive: boolean): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set({ isActive })
      .where(eq(vendors.id, id))
      .returning();
    return result[0];
  }

  async deleteVendor(id: string): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id)).returning();
    return result.length > 0;
  }

  // CRM: Leads
  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.score), desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
    return result[0];
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async claimLead(id: string, vendorId: string): Promise<Lead | undefined> {
    // Check if lead is already claimed
    const lead = await this.getLead(id);
    if (lead?.vendorId) {
      throw new Error('Lead já está reservado para outro vendedor');
    }
    
    const result = await db.update(leads)
      .set({ vendorId, claimedAt: new Date(), updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async releaseLead(id: string): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set({ vendorId: null, claimedAt: null, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async updateLeadScore(id: string, score: number, temperature: string): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set({ score, temperature, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async convertLead(id: string, registrationId: string): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set({ 
        status: 'convertido', 
        convertedAt: new Date(), 
        registrationId,
        updatedAt: new Date() 
      })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  // CRM: Lead Activities
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return await db.select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const result = await db.insert(leadActivities).values(activity).returning();
    
    // Update lead's lastContactAt
    await db.update(leads)
      .set({ lastContactAt: new Date(), updatedAt: new Date() })
      .where(eq(leads.id, activity.leadId));
    
    // Apply score change if any
    if (activity.scoreChange && activity.scoreChange !== 0) {
      const lead = await this.getLead(activity.leadId);
      if (lead) {
        const newScore = Math.max(0, Math.min(100, lead.score + (activity.scoreChange || 0)));
        let temperature = 'cold';
        if (newScore >= 70) temperature = 'hot';
        else if (newScore >= 40) temperature = 'warm';
        await this.updateLeadScore(activity.leadId, newScore, temperature);
      }
    }
    
    return result[0];
  }

  // CRM: Lead Follow-ups
  async getLeadFollowUps(leadId: string): Promise<LeadFollowUp[]> {
    return await db.select()
      .from(leadFollowUps)
      .where(eq(leadFollowUps.leadId, leadId))
      .orderBy(leadFollowUps.scheduledAt);
  }

  async getPendingFollowUps(vendorId?: string): Promise<(LeadFollowUp & { leadName?: string | null; leadEmail?: string | null })[]> {
    const conditions = [eq(leadFollowUps.isCompleted, false)];
    if (vendorId) {
      conditions.push(eq(leadFollowUps.vendorId, vendorId));
    }
    const result = await db.select({
      id: leadFollowUps.id,
      leadId: leadFollowUps.leadId,
      vendorId: leadFollowUps.vendorId,
      type: leadFollowUps.type,
      description: leadFollowUps.description,
      scheduledAt: leadFollowUps.scheduledAt,
      isCompleted: leadFollowUps.isCompleted,
      completedAt: leadFollowUps.completedAt,
      createdAt: leadFollowUps.createdAt,
      leadName: leads.name,
      leadEmail: leads.email,
    })
      .from(leadFollowUps)
      .leftJoin(leads, eq(leadFollowUps.leadId, leads.id))
      .where(and(...conditions))
      .orderBy(leadFollowUps.scheduledAt);
    return result;
  }

  async createLeadFollowUp(followUp: InsertLeadFollowUp): Promise<LeadFollowUp> {
    const result = await db.insert(leadFollowUps).values(followUp).returning();
    return result[0];
  }

  async completeFollowUp(id: string): Promise<LeadFollowUp | undefined> {
    const result = await db.update(leadFollowUps)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(leadFollowUps.id, id))
      .returning();
    return result[0];
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const result = await db.delete(leadFollowUps).where(eq(leadFollowUps.id, id)).returning();
    return result.length > 0;
  }

  // CRM: Delete activity (admin only)
  async deleteLeadActivity(id: string): Promise<boolean> {
    const result = await db.delete(leadActivities).where(eq(leadActivities.id, id)).returning();
    return result.length > 0;
  }

  // Users (for authentication)
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Vendor update (full)
  async updateVendorFull(id: string, data: { name?: string; email?: string; isActive?: boolean }): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set(data)
      .where(eq(vendors.id, id))
      .returning();
    return result[0];
  }

  // Get converted leads with registration details
  async getConvertedLeadsWithRegistrations(): Promise<Array<Lead & { registration?: Registration }>> {
    const convertedLeads = await db.select()
      .from(leads)
      .where(eq(leads.status, 'convertido'))
      .orderBy(desc(leads.convertedAt));
    
    const result = await Promise.all(convertedLeads.map(async (lead) => {
      let registration: Registration | undefined;
      if (lead.registrationId) {
        registration = await this.getRegistration(lead.registrationId);
      }
      return { ...lead, registration };
    }));
    
    return result;
  }

  // Vendor Activity Log
  async logVendorAction(log: InsertVendorActivityLog): Promise<VendorActivityLog> {
    const result = await db.insert(vendorActivityLog).values(log).returning();
    return result[0];
  }

  async getVendorActivityLogs(filters: {
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
    actionType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: VendorActivityLog[]; total: number }> {
    const conditions = [];
    
    if (filters.vendorId) {
      conditions.push(eq(vendorActivityLog.vendorId, filters.vendorId));
    }
    if (filters.startDate) {
      conditions.push(gte(vendorActivityLog.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(sql`${vendorActivityLog.createdAt} <= ${endOfDay}`);
    }
    if (filters.actionType) {
      conditions.push(eq(vendorActivityLog.actionType, filters.actionType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)::integer` })
      .from(vendorActivityLog)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Get paginated logs
    let query = db.select()
      .from(vendorActivityLog)
      .where(whereClause)
      .orderBy(desc(vendorActivityLog.createdAt));
    
    if (filters.limit) {
      query = query.limit(filters.limit) as typeof query;
    }
    if (filters.offset) {
      query = query.offset(filters.offset) as typeof query;
    }

    const logs = await query;
    return { logs, total };
  }

  async getVendorActivitySummary(vendorId?: string, days: number = 7): Promise<{
    totalActions: number;
    actionsByType: { actionType: string; count: number }[];
    actionsByDay: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const conditions = [gte(vendorActivityLog.createdAt, startDate)];
    if (vendorId) {
      conditions.push(eq(vendorActivityLog.vendorId, vendorId));
    }
    const whereClause = and(...conditions);

    // Total actions
    const totalResult = await db.select({ count: sql<number>`count(*)::integer` })
      .from(vendorActivityLog)
      .where(whereClause);
    const totalActions = totalResult[0]?.count || 0;

    // Actions by type
    const byTypeResult = await db.execute(sql`
      SELECT action_type as "actionType", COUNT(*)::integer as count
      FROM vendor_activity_log
      WHERE created_at >= ${startDate}
      ${vendorId ? sql`AND vendor_id = ${vendorId}` : sql``}
      GROUP BY action_type
      ORDER BY count DESC
    `);

    // Actions by day
    const byDayResult = await db.execute(sql`
      SELECT 
        TO_CHAR((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') as date,
        COUNT(*)::integer as count
      FROM vendor_activity_log
      WHERE created_at >= ${startDate}
      ${vendorId ? sql`AND vendor_id = ${vendorId}` : sql``}
      GROUP BY TO_CHAR((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
      ORDER BY date DESC
    `);

    return {
      totalActions,
      actionsByType: byTypeResult.rows as { actionType: string; count: number }[],
      actionsByDay: byDayResult.rows as { date: string; count: number }[],
    };
  }
}

export const storage = new DbStorage();
