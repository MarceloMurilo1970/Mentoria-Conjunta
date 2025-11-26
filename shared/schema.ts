import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== MENTORSHIP REGISTRATIONS ====================

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReceived: boolean("payment_received").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  paymentReceived: true,
}).extend({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  paymentMethod: z.enum(["pix", "installments"], {
    required_error: "Selecione uma forma de pagamento",
  }),
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// ==================== BOARD MANAGEMENT SYSTEM ====================

// User roles for board management
export const userRoleEnum = ["presidente", "secretaria", "conselheiro", "convidado"] as const;
export type UserRole = typeof userRoleEnum[number];

// Minutes status
export const minutesStatusEnum = ["draft", "pending_approval", "published"] as const;
export type MinutesStatus = typeof minutesStatusEnum[number];

// Task status
export const taskStatusEnum = ["open", "in_progress", "proposed_done", "closed"] as const;
export type TaskStatus = typeof taskStatusEnum[number];

// Users table (for board management authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  isFirstLogin: boolean("is_first_login").default(true).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isFirstLogin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Memberships (users linked to companies with roles)
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<UserRole>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserCompany: unique().on(table.userId, table.companyId),
}));

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
}).extend({
  role: z.enum(userRoleEnum),
});

export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

// Invites for new users
export const invites = pgTable("invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().$type<UserRole>(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  accepted: boolean("accepted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInviteSchema = createInsertSchema(invites).omit({
  id: true,
  createdAt: true,
  token: true,
  accepted: true,
}).extend({
  role: z.enum(userRoleEnum),
  email: z.string().email("Email inválido"),
});

export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type Invite = typeof invites.$inferSelect;

// Meetings table
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  location: text("location"),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Agenda items for meetings
export const agendaItems = pgTable("agenda_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  orderNumber: integer("order_number").notNull(),
  title: text("title").notNull(),
  startTime: text("start_time"), // HH:mm format
  durationMinutes: integer("duration_minutes"),
  responsibleUserId: varchar("responsible_user_id").references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAgendaItemSchema = createInsertSchema(agendaItems).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  orderNumber: z.number().int().positive(),
});

export type InsertAgendaItem = z.infer<typeof insertAgendaItemSchema>;
export type AgendaItem = typeof agendaItems.$inferSelect;

// Attachments (can be linked to agenda items, meetings, or tasks)
export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  agendaItemId: varchar("agenda_item_id").references(() => agendaItems.id, { onDelete: "cascade" }),
  meetingId: varchar("meeting_id").references(() => meetings.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  uploadedByUserId: varchar("uploaded_by_user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  mimeType: text("mime_type"),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Nome do arquivo é obrigatório"),
  url: z.string().url("URL inválida"),
});

export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;

// Meeting minutes
export const minutes = pgTable("minutes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }).unique(),
  status: text("status").notNull().$type<MinutesStatus>().default("draft"),
  content: text("content"), // Markdown content
  transcription: text("transcription"), // Original transcription
  pdfUrl: text("pdf_url"),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMinutesSchema = createInsertSchema(minutes).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
}).extend({
  status: z.enum(minutesStatusEnum).optional(),
});

export type InsertMinutes = z.infer<typeof insertMinutesSchema>;
export type Minutes = typeof minutes.$inferSelect;

// Tasks/Pending items
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  meetingId: varchar("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  agendaItemId: varchar("agenda_item_id").references(() => agendaItems.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  assignedToUserId: varchar("assigned_to_user_id").notNull().references(() => users.id),
  status: text("status").notNull().$type<TaskStatus>().default("open"),
  dueDate: timestamp("due_date"),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  status: z.enum(taskStatusEnum).optional(),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task comments
export const taskComments = pgTable("task_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
}).extend({
  text: z.string().min(1, "Comentário não pode estar vazio"),
});

export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type TaskComment = typeof taskComments.$inferSelect;

// Extended types for frontend use
export type MembershipWithUser = Membership & { user: User };
export type MembershipWithCompany = Membership & { company: Company };
export type MeetingWithAgenda = Meeting & { agendaItems: AgendaItem[] };
export type AgendaItemWithAttachments = AgendaItem & { attachments: Attachment[]; responsible?: User };
export type TaskWithComments = Task & { comments: TaskComment[]; assignedTo: User };
