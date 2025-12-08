import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
