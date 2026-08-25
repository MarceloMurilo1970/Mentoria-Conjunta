import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ------ Turma Configuration ------
export interface PaymentPlan {
  id: string;           // matches paymentMethod: "pix", "installments", "installments10", or custom
  label: string;        // display name: "PIX", "5x Cartão", "10x Cartão"
  totalAmount: number;  // R$ total charged
  installments: number; // 1, 5, 10, etc.
  feeRate: number;      // gateway fee rate 0..1 (e.g. 0.088 = 8.80%)
  paymentLink: string;  // URL or ""
}

export interface BatchPricingItem {
  batch: number;
  label: string;
  deadline: string;
  plans: PaymentPlan[];  // flexible payment plans (replaces fixed pixPrice/card5Total/card10Total)
}

export const turmaConfigs = pgTable("turma_configs", {
  id: serial("id").primaryKey(),
  turmaId: text("turma_id").notNull().unique(),    // "turma_3", "turma_4", …
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  taxRate: real("tax_rate").notNull().default(0.1175),           // imposto sobre bruto
  card5FeeRate: real("card5_fee_rate").notNull().default(0.088), // taxa gateway 5x
  card10FeeRate: real("card10_fee_rate").notNull().default(0.1506), // taxa gateway 10x
  vendorCommissionRate: real("vendor_commission_rate").notNull().default(0.1667), // % do líquido
  mmRate: real("mm_rate").notNull().default(0.6667),             // % da sobra → Marcelo
  hfRate: real("hf_rate").notNull().default(0.3333),             // % da sobra → Hamilton
  card5PaymentLink: text("card5_payment_link").notNull().default(""),
  card10PaymentLink: text("card10_payment_link").notNull().default(""),
  batches: jsonb("batches").$type<BatchPricingItem[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTurmaConfigSchema = createInsertSchema(turmaConfigs).omit({ id: true, createdAt: true });
export type InsertTurmaConfig = z.infer<typeof insertTurmaConfigSchema>;
export type TurmaConfig = typeof turmaConfigs.$inferSelect;

// Users table for authentication (admin and vendor access)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("vendor"), // admin or vendor
  vendorId: text("vendor_id"), // Links to vendor if role is vendor
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.enum(["admin", "vendor"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vendors table for CRM
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  hasCommission: boolean("has_commission").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Leads table for CRM (imported from Google Sheets)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sheetRowId: text("sheet_row_id"), // To track original row in Google Sheets
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  linkedin: text("linkedin"),
  // Survey responses stored as JSON
  surveyResponses: jsonb("survey_responses").$type<Record<string, string>>(),
  // Lead scoring and status
  score: integer("score").default(0).notNull(),
  scoreBreakdown: jsonb("score_breakdown").$type<Array<{category: string; points: number; reason: string; question: string; answer: string}>>(), // Array of score breakdown items
  temperature: text("temperature").default("cold").notNull(), // cold, warm, hot
  status: text("status").default("novo").notNull(), // novo, em_contato, qualificado, negociando, convertido, perdido
  // Assignment
  vendorId: text("vendor_id"),
  claimedAt: timestamp("claimed_at"),
  // AI-generated summary
  aiSummary: text("ai_summary"),
  // Conversion tracking
  convertedAt: timestamp("converted_at"),
  registrationId: text("registration_id"),
  // Timestamps
  lastContactAt: timestamp("last_contact_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Score breakdown item type
export type ScoreBreakdownItem = {
  category: string;
  points: number;
  reason: string;
  question: string;
  answer: string;
};

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  surveyResponses: z.record(z.string(), z.string()).optional().nullable(),
  scoreBreakdown: z.array(z.object({
    category: z.string(),
    points: z.number(),
    reason: z.string(),
    question: z.string(),
    answer: z.string(),
  })).optional().nullable(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Lead Activities (interaction history)
export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: text("lead_id").notNull(),
  vendorId: text("vendor_id"),
  type: text("type").notNull(), // note, call, email, whatsapp, meeting, status_change
  content: text("content").notNull(),
  // AI-generated insights
  aiAnalysis: text("ai_analysis"),
  scoreChange: integer("score_change").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;

// Lead Follow-ups (scheduled tasks)
export const leadFollowUps = pgTable("lead_follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: text("lead_id").notNull(),
  vendorId: text("vendor_id"),
  type: text("type").notNull(), // call, email, meeting, whatsapp
  description: text("description").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadFollowUpSchema = createInsertSchema(leadFollowUps).omit({
  id: true,
  createdAt: true,
});

export type InsertLeadFollowUp = z.infer<typeof insertLeadFollowUpSchema>;
export type LeadFollowUp = typeof leadFollowUps.$inferSelect;

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  cpfCnpj: text("cpf_cnpj").notNull(),
  razaoSocial: text("razao_social"),
  paymentMethod: text("payment_method").notNull(),
  paymentReceived: boolean("payment_received").default(false).notNull(),
  paymentStatus: text("payment_status").default("pendente").notNull(),
  paidAmount: integer("paid_amount").default(0),
  totalAmount: integer("total_amount").default(0),
  remainingPaymentDate: timestamp("remaining_payment_date"),
  vendor: text("vendor"),
  batch: integer("batch").default(3),
  turma: text("turma").default("turma_2").notNull(),
  observations: text("observations"),
  invoiceIssued: boolean("invoice_issued").default(false),
  invoiceIssuedAt: timestamp("invoice_issued_at"),
  invoices: text("invoices"),
  vendorCommissionPaid: integer("vendor_commission_paid").default(0),
  vendorCommissionPaidAt: timestamp("vendor_commission_paid_at"),
  vendorPayments: text("vendor_payments"),
  hamiltonPaid: integer("hamilton_paid").default(0),
  hamiltonPaidAt: timestamp("hamilton_paid_at"),
  nfId: integer("nf_id"),
  nfStatus: text("nf_status"),
  nfPdfUrl: text("nf_pdf_url"),
  nfEmittedAt: timestamp("nf_emitted_at"),
  nfNumber: text("nf_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  paymentReceived: true,
  paymentStatus: true,
  paidAmount: true,
  totalAmount: true,
  remainingPaymentDate: true,
}).extend({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos").max(18, "CPF/CNPJ inválido"),
  razaoSocial: z.string().optional(),
  paymentMethod: z.enum(["pix", "installments", "installments10"], {
    required_error: "Selecione uma forma de pagamento",
  }),
  turma: z.enum(["turma_3", "turma_4"], {
    required_error: "Selecione a turma desejada",
  }),
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// Manual registration schema for vendors (includes payment fields)
export const insertManualRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos").max(18, "CPF/CNPJ inválido"),
  razaoSocial: z.string().optional().nullable(),
  paymentMethod: z.enum(["pix", "installments", "installments10"]),
  paymentStatus: z.enum(["pendente", "parcial", "pago"]),
  totalAmount: z.number().min(0, "Valor total deve ser positivo"),
  paidAmount: z.number().min(0, "Valor pago deve ser positivo"),
  observations: z.string().optional().nullable(),
  turma: z.enum(["turma_2", "turma_3", "turma_4"]).default("turma_3"),
  leadId: z.string().optional().nullable(),
});

export type InsertManualRegistration = z.infer<typeof insertManualRegistrationSchema>;

// Page Views table for analytics
export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

// Vendor Activity Log for tracking all vendor actions
export const vendorActivityLog = pgTable("vendor_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  vendorName: text("vendor_name").notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  leadName: text("lead_name"),
  actionType: text("action_type").notNull(), // claim_lead, release_lead, add_activity, create_followup, complete_followup, update_status, view_lead
  actionDescription: text("action_description").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorActivityLogSchema = createInsertSchema(vendorActivityLog).omit({
  id: true,
  createdAt: true,
});

export type InsertVendorActivityLog = z.infer<typeof insertVendorActivityLogSchema>;
export type VendorActivityLog = typeof vendorActivityLog.$inferSelect;

// Commission Payments table for tracking vendor commissions and mentor transfers
export const commissionPayments = pgTable("commission_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").references(() => registrations.id),
  recipientType: text("recipient_type").notNull(), // 'vendor', 'mentor' (Hamilton Felix)
  recipientId: varchar("recipient_id"), // vendor_id for vendors, null for mentor
  recipientName: text("recipient_name").notNull(),
  totalAmount: integer("total_amount").notNull(), // Total commission/transfer amount in cents
  paidAmount: integer("paid_amount").default(0).notNull(), // Amount already paid in cents
  status: text("status").default("pendente").notNull(), // pendente, parcial, pago
  notes: text("notes"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommissionPaymentSchema = createInsertSchema(commissionPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommissionPayment = z.infer<typeof insertCommissionPaymentSchema>;
export type CommissionPayment = typeof commissionPayments.$inferSelect;

// Commission Payment History for tracking individual payments
export const commissionPaymentHistory = pgTable("commission_payment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commissionPaymentId: varchar("commission_payment_id").references(() => commissionPayments.id),
  amount: integer("amount").notNull(), // Amount paid in this transaction in cents
  paymentMethod: text("payment_method"), // pix, transferencia, etc
  notes: text("notes"),
  paidBy: text("paid_by"), // Who made the payment
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommissionPaymentHistorySchema = createInsertSchema(commissionPaymentHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertCommissionPaymentHistory = z.infer<typeof insertCommissionPaymentHistorySchema>;
export type CommissionPaymentHistory = typeof commissionPaymentHistory.$inferSelect;

// Session table for connect-pg-simple (express-session store)
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});
