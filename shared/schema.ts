import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  batch: integer("batch").default(1),
  observations: text("observations"),
  invoiceIssued: boolean("invoice_issued").default(false),
  invoiceIssuedAt: timestamp("invoice_issued_at"),
  invoices: text("invoices"),
  vendorCommissionPaid: integer("vendor_commission_paid").default(0),
  vendorCommissionPaidAt: timestamp("vendor_commission_paid_at"),
  vendorPayments: text("vendor_payments"),
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
  paymentMethod: z.enum(["pix", "installments"], {
    required_error: "Selecione uma forma de pagamento",
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
  paymentMethod: z.enum(["pix", "installments"]),
  paymentStatus: z.enum(["pendente", "parcial", "pago"]),
  totalAmount: z.number().min(0, "Valor total deve ser positivo"),
  paidAmount: z.number().min(0, "Valor pago deve ser positivo"),
  observations: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(), // Optional link to a lead
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
