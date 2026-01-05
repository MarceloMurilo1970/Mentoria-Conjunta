import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  surveyResponses: jsonb("survey_responses"),
  // Lead scoring and status
  score: integer("score").default(0).notNull(),
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

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
