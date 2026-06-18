import { 
  type Registration, type InsertRegistration, registrations, 
  type PageView, type InsertPageView, pageViews,
  type Vendor, type InsertVendor, vendors,
  type Lead, type InsertLead, leads,
  type LeadActivity, type InsertLeadActivity, leadActivities,
  type LeadFollowUp, type InsertLeadFollowUp, leadFollowUps,
  type User, type InsertUser, users,
  type VendorActivityLog, type InsertVendorActivityLog, vendorActivityLog,
  type CommissionPayment, type InsertCommissionPayment, commissionPayments,
  type CommissionPaymentHistory, type InsertCommissionPaymentHistory, commissionPaymentHistory,
  type TurmaConfig, type InsertTurmaConfig, turmaConfigs, type BatchPricingItem
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

export interface HamiltonPaymentUpdate {
  hamiltonPaid: number;
  hamiltonPaidAt: Date | null;
}

export interface BatchUpdate {
  batch: number;
}

export interface NfUpdate {
  nfId: number;
  nfStatus: string;
  nfPdfUrl?: string | null;
  nfEmittedAt?: Date | null;
  nfNumber?: string | null;
}

export interface ManualRegistrationData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  razaoSocial?: string | null;
  paymentMethod: 'pix' | 'installments' | 'installments10';
  paymentStatus: 'pendente' | 'parcial' | 'pago';
  totalAmount: number;
  paidAmount: number;
  observations?: string | null;
  vendor?: string | null;
  turma?: string | null;
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
  updateHamiltonPayment(id: string, update: HamiltonPaymentUpdate): Promise<Registration | undefined>;
  updateBatch(id: string, update: BatchUpdate): Promise<Registration | undefined>;
  updateNfStatus(id: string, update: NfUpdate): Promise<Registration | undefined>;

  // Turma configs
  getTurmaConfigs(): Promise<TurmaConfig[]>;
  getTurmaConfig(turmaId: string): Promise<TurmaConfig | undefined>;
  createTurmaConfig(data: InsertTurmaConfig): Promise<TurmaConfig>;
  updateTurmaConfig(id: number, data: Partial<InsertTurmaConfig>): Promise<TurmaConfig | undefined>;
  seedTurmaConfigsIfEmpty(): Promise<void>;
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
      turma: data.turma || 'turma_3',
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

  async updateHamiltonPayment(id: string, update: HamiltonPaymentUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ 
        hamiltonPaid: update.hamiltonPaid,
        hamiltonPaidAt: update.hamiltonPaidAt
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

  async updateNfStatus(id: string, update: NfUpdate): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({
        nfId: update.nfId,
        nfStatus: update.nfStatus,
        nfPdfUrl: update.nfPdfUrl ?? null,
        nfEmittedAt: update.nfEmittedAt ?? null,
        nfNumber: update.nfNumber ?? null,
      })
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

  async updateVendorDetails(id: string, data: { name?: string; email?: string; isActive?: boolean; hasCommission?: boolean }): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set(data)
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

  async findLeadByPhone(phone: string): Promise<Lead | undefined> {
    // Normalize phone number - remove all non-digits
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 8) return undefined;
    
    // Get all leads and match by normalized phone
    const allLeads = await db.select().from(leads);
    return allLeads.find(lead => {
      if (!lead.phone) return false;
      const leadPhone = lead.phone.replace(/\D/g, '');
      // Match last 8-9 digits to handle different formats
      const phoneToMatch = normalizedPhone.slice(-9);
      const leadPhoneToMatch = leadPhone.slice(-9);
      return phoneToMatch === leadPhoneToMatch || 
             normalizedPhone.slice(-8) === leadPhone.slice(-8);
    });
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

  async getAllLeadActivities(): Promise<LeadActivity[]> {
    return await db.select()
      .from(leadActivities)
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

  async getAllLeadFollowUps(): Promise<LeadFollowUp[]> {
    return await db.select()
      .from(leadFollowUps)
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

  // Commission Payment methods
  async getCommissionPayments(): Promise<CommissionPayment[]> {
    return await db.select().from(commissionPayments).orderBy(desc(commissionPayments.createdAt));
  }

  async getCommissionPaymentsByRegistration(registrationId: string): Promise<CommissionPayment[]> {
    return await db.select().from(commissionPayments)
      .where(eq(commissionPayments.registrationId, registrationId))
      .orderBy(desc(commissionPayments.createdAt));
  }

  async getCommissionPaymentsByRecipient(recipientType: string, recipientId?: string): Promise<CommissionPayment[]> {
    if (recipientId) {
      return await db.select().from(commissionPayments)
        .where(and(
          eq(commissionPayments.recipientType, recipientType),
          eq(commissionPayments.recipientId, recipientId)
        ))
        .orderBy(desc(commissionPayments.createdAt));
    }
    return await db.select().from(commissionPayments)
      .where(eq(commissionPayments.recipientType, recipientType))
      .orderBy(desc(commissionPayments.createdAt));
  }

  async createCommissionPayment(payment: InsertCommissionPayment): Promise<CommissionPayment> {
    const result = await db.insert(commissionPayments).values(payment).returning();
    return result[0];
  }

  async updateCommissionPaymentAmount(id: string, paidAmount: number): Promise<CommissionPayment | undefined> {
    const payment = await db.select().from(commissionPayments).where(eq(commissionPayments.id, id)).limit(1);
    if (!payment[0]) return undefined;

    let status = 'pendente';
    let paidAt = null;
    if (paidAmount >= payment[0].totalAmount) {
      status = 'pago';
      paidAt = new Date();
    } else if (paidAmount > 0) {
      status = 'parcial';
    }

    const result = await db.update(commissionPayments)
      .set({ 
        paidAmount, 
        status, 
        paidAt,
        updatedAt: new Date() 
      })
      .where(eq(commissionPayments.id, id))
      .returning();
    return result[0];
  }

  async addCommissionPaymentEntry(paymentId: string, amount: number, paymentMethod?: string, notes?: string, paidBy?: string): Promise<CommissionPaymentHistory> {
    // Add history entry
    const historyResult = await db.insert(commissionPaymentHistory).values({
      commissionPaymentId: paymentId,
      amount,
      paymentMethod,
      notes,
      paidBy
    }).returning();

    // Update the commission payment total
    const payment = await db.select().from(commissionPayments).where(eq(commissionPayments.id, paymentId)).limit(1);
    if (payment[0]) {
      const newPaidAmount = payment[0].paidAmount + amount;
      await this.updateCommissionPaymentAmount(paymentId, newPaidAmount);
    }

    return historyResult[0];
  }

  async getCommissionPaymentHistory(paymentId: string): Promise<CommissionPaymentHistory[]> {
    return await db.select().from(commissionPaymentHistory)
      .where(eq(commissionPaymentHistory.commissionPaymentId, paymentId))
      .orderBy(desc(commissionPaymentHistory.createdAt));
  }

  async deleteCommissionPaymentEntry(historyId: string): Promise<boolean> {
    // Get the entry first to know the amount
    const entry = await db.select().from(commissionPaymentHistory)
      .where(eq(commissionPaymentHistory.id, historyId)).limit(1);
    
    if (!entry[0]) return false;

    // Delete the entry
    await db.delete(commissionPaymentHistory).where(eq(commissionPaymentHistory.id, historyId));

    // Update the payment total
    const payment = await db.select().from(commissionPayments)
      .where(eq(commissionPayments.id, entry[0].commissionPaymentId!)).limit(1);
    
    if (payment[0]) {
      const newPaidAmount = Math.max(0, payment[0].paidAmount - entry[0].amount);
      await this.updateCommissionPaymentAmount(payment[0].id, newPaidAmount);
    }

    return true;
  }

  // Get financial summary for Marcelo and Hamilton
  async getFinancialSummary(): Promise<{
    marceloTotal: number;
    marceloReceived: number;
    hamiltonTotal: number;
    hamiltonReceived: number;
  }> {
    // Get all registrations
    const allRegistrations = await this.getAllRegistrations();
    
    // Calculate totals based on batch pricing
    const batchPrices: Record<number, { total: number; marcelo: number; hamilton: number }> = {
      1: { total: 800000, marcelo: 500000, hamilton: 300000 },
      2: { total: 900000, marcelo: 560000, hamilton: 340000 },
      3: { total: 1000000, marcelo: 620000, hamilton: 380000 },
    };

    let marceloTotal = 0;
    let marceloReceived = 0;
    let hamiltonTotal = 0;
    let hamiltonReceived = 0;

    for (const reg of allRegistrations) {
      const batch = reg.batch || 3;
      const prices = batchPrices[batch] || batchPrices[3];
      
      // Total amounts (what they should get when fully paid)
      marceloTotal += prices.marcelo;
      hamiltonTotal += prices.hamilton;

      // Received amounts (proportional to payment received)
      if (reg.paymentStatus === 'pago') {
        marceloReceived += prices.marcelo;
        hamiltonReceived += prices.hamilton;
      } else if (reg.paymentStatus === 'parcial' && reg.paidAmount && reg.totalAmount) {
        const paidRatio = reg.paidAmount / reg.totalAmount;
        marceloReceived += Math.round(prices.marcelo * paidRatio);
        hamiltonReceived += Math.round(prices.hamilton * paidRatio);
      }
    }

    return { marceloTotal, marceloReceived, hamiltonTotal, hamiltonReceived };
  }

  // ---- Turma Configs ----
  async getTurmaConfigs(): Promise<TurmaConfig[]> {
    return await db.select().from(turmaConfigs).orderBy(desc(turmaConfigs.createdAt));
  }

  async getTurmaConfig(turmaId: string): Promise<TurmaConfig | undefined> {
    const result = await db.select().from(turmaConfigs).where(eq(turmaConfigs.turmaId, turmaId)).limit(1);
    return result[0];
  }

  async createTurmaConfig(data: InsertTurmaConfig): Promise<TurmaConfig> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(turmaConfigs).values(data as any).returning();
    return result[0];
  }

  async updateTurmaConfig(id: number, data: Partial<InsertTurmaConfig>): Promise<TurmaConfig | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.update(turmaConfigs).set(data as any).where(eq(turmaConfigs.id, id)).returning();
    return result[0];
  }

  async seedTurmaConfigsIfEmpty(): Promise<void> {
    const existing = await db.select().from(turmaConfigs).limit(1);
    if (existing.length > 0) {
      // Check if existing data uses old format (no plans array)
      const firstBatches = existing[0].batches as any[];
      if (firstBatches.length > 0 && firstBatches[0].plans) {
        return; // Already new format, skip
      }
      // Old format detected — delete all and re-seed with new format
      await db.delete(turmaConfigs);
      console.log("[seed] turma_configs: old format detected, re-seeding with new plans format");
    }

    // turma_2 (legacy, 5% vendor)
    const t2Batches: BatchPricingItem[] = [
      { batch: 1, label: "Lote 1", deadline: "07/12/2025", plans: [
        { id: "pix", label: "PIX", totalAmount: 8000, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 8875, installments: 5, feeRate: 0.088, paymentLink: "" },
      ]},
      { batch: 2, label: "Lote 2", deadline: "31/12/2025", plans: [
        { id: "pix", label: "PIX", totalAmount: 8700, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 9650, installments: 5, feeRate: 0.088, paymentLink: "" },
      ]},
      { batch: 3, label: "Lote 3", deadline: "04/01/2026", plans: [
        { id: "pix", label: "PIX", totalAmount: 9400, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 10425, installments: 5, feeRate: 0.088, paymentLink: "" },
        { id: "installments10", label: "10x Cartão", totalAmount: 11000, installments: 10, feeRate: 0.1506, paymentLink: "" },
      ]},
      { batch: 4, label: "Lote 4 (Especial)", deadline: "Condição Especial", plans: [
        { id: "pix", label: "PIX", totalAmount: 10000, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 10000, installments: 5, feeRate: 0.088, paymentLink: "" },
      ]},
    ];

    // turma_3 and turma_4 (16.67% vendor) — values from official financial waterfall
    const t34Batches: BatchPricingItem[] = [
      { batch: 1, label: "Lote 1", deadline: "07/12/2025", plans: [
        { id: "pix", label: "PIX", totalAmount: 8000, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 8875, installments: 5, feeRate: 0.088, paymentLink: "" },
      ]},
      { batch: 2, label: "Lote 2", deadline: "31/12/2025", plans: [
        { id: "pix", label: "PIX", totalAmount: 8700, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 9650, installments: 5, feeRate: 0.088, paymentLink: "" },
      ]},
      { batch: 3, label: "Lote 3", deadline: "04/01/2026", plans: [
        { id: "pix", label: "PIX", totalAmount: 9952.18, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 11054.50, installments: 5, feeRate: 0.088, paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00" },
        { id: "installments10", label: "10x Cartão", totalAmount: 12000, installments: 10, feeRate: 0.1506, paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00" },
      ]},
      { batch: 4, label: "Lote 4 (Especial)", deadline: "Condição Especial", plans: [
        { id: "pix", label: "PIX", totalAmount: 9952.18, installments: 1, feeRate: 0, paymentLink: "" },
        { id: "installments", label: "5x Cartão", totalAmount: 11054.50, installments: 5, feeRate: 0.088, paymentLink: "" },
        { id: "installments10", label: "10x Cartão", totalAmount: 12000, installments: 10, feeRate: 0.1506, paymentLink: "" },
      ]},
    ];

    await db.insert(turmaConfigs).values([
      {
        turmaId: "turma_2",
        name: "Turma 2 (Legado)",
        active: false,
        taxRate: 0.1175,
        card5FeeRate: 0.088,
        card10FeeRate: 0.1506,
        vendorCommissionRate: 0.05,
        mmRate: 0.6667,
        hfRate: 0.3333,
        card5PaymentLink: "",
        card10PaymentLink: "",
        batches: t2Batches,
      },
      {
        turmaId: "turma_3",
        name: "Turma 3 — Segundas-feiras",
        active: true,
        taxRate: 0.1175,
        card5FeeRate: 0.088,
        card10FeeRate: 0.1506,
        vendorCommissionRate: 0.1667,
        mmRate: 0.6667,
        hfRate: 0.3333,
        card5PaymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
        card10PaymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
        batches: t34Batches,
      },
      {
        turmaId: "turma_4",
        name: "Turma 4 — Quartas-feiras",
        active: true,
        taxRate: 0.1175,
        card5FeeRate: 0.088,
        card10FeeRate: 0.1506,
        vendorCommissionRate: 0.1667,
        mmRate: 0.6667,
        hfRate: 0.3333,
        card5PaymentLink: "",
        card10PaymentLink: "",
        batches: t34Batches,
      },
    ] as any);

    console.log("[seed] turma_configs seeded with new plans format (PIX/5x/10x per lote)");
  }
}

export const storage = new DbStorage();
