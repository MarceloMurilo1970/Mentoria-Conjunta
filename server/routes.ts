import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertRegistrationSchema, insertVendorSchema, insertLeadActivitySchema, insertLeadFollowUpSchema, type User } from "@shared/schema";
import { sendRegistrationEmail, sendRegistrationListEmail, sendRegistrationNotificationEmail, sendTestEmail, sendPaidConfirmationEmail, sendPartialPaymentEmail, sendPendingPaymentEmail } from "./email";
import { addEventRegistration, getAllEventRegistrations, type EventRegistration, fetchSurveyResponses, calculateLeadScore } from "./googleSheets";
import path from "path";
import { z } from "zod";
import PDFDocument from "pdfkit";

// Secret for signing tokens - must be set via environment
const TOKEN_SECRET = process.env.SESSION_SECRET;
if (!TOKEN_SECRET) {
  console.error("FATAL: SESSION_SECRET environment variable is required for token signing");
}

// Generate a signed auth token for email-based authentication
function generateAuthToken(email: string): string {
  if (!TOKEN_SECRET) {
    throw new Error("SESSION_SECRET not configured");
  }
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

// Verify a signed auth token (valid for 7 days)
function verifyAuthToken(token: string): { email: string; valid: boolean } {
  try {
    if (!TOKEN_SECRET) {
      return { email: '', valid: false };
    }
    
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, timestampStr, signature] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);
    
    // Check expiry (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return { email: '', valid: false };
    }
    
    // Verify signature
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(`${email}:${timestampStr}`).digest('hex');
    if (signature !== expectedSig) {
      return { email: '', valid: false };
    }
    
    return { email, valid: true };
  } catch {
    return { email: '', valid: false };
  }
}

// Password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  if (!session?.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check session first
  const session = (req as any).session;
  if (session?.userId && session.role === 'admin') {
    return next();
  }
  
  // Also accept admin email header for simple email-only login
  const adminEmail = req.headers['x-admin-email'] as string;
  if (adminEmail?.toLowerCase() === 'contato@marcelomurilo.com.br') {
    return next();
  }
  
  return res.status(401).json({ error: "Não autenticado" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user if not exists
  const adminEmail = "contato@marcelomurilo.com.br";
  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPw = await hashPassword("admin123");
    await storage.createUser({
      email: adminEmail,
      password: hashedPw,
      name: "Marcelo Murilo",
      role: "admin",
      isActive: true,
    });
    console.log("Admin user created");
  }

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const session = (req as any).session;
      session.userId = user.id;
      session.role = user.role;
      session.vendorId = user.vendorId;
      session.userName = user.name;
      session.userEmail = user.email;

      // Generate auth token for fallback authentication
      const authToken = generateAuthToken(user.email);

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        vendorId: user.vendorId,
        authToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro no login" });
    }
  });

  // Email-only login for CRM (vendors and admin)
  app.post("/api/auth/email-login", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      const ADMIN_EMAILS = ["contato@marcelomurilo.com.br", "marcelo@marcelomurilo.com.br", "hamilton@opes.com.br"];
      
      let name = 'Admin';
      let vendorId: string | null = null;
      
      // First check if email is registered as a vendor
      const vendor = await storage.getVendorByEmail(normalizedEmail);
      if (vendor && vendor.isActive) {
        name = vendor.name;
        vendorId = vendor.id;
      } else if (ADMIN_EMAILS.includes(normalizedEmail)) {
        // Admin without vendor registration
        name = normalizedEmail === 'hamilton@opes.com.br' ? 'Hamilton Felix' : 'Marcelo Murilo';
      } else {
        return res.status(401).json({ error: "Email não autorizado" });
      }
      
      // Create session
      const session = (req as any).session;
      session.userId = `email-${normalizedEmail}`;
      session.role = ADMIN_EMAILS.includes(normalizedEmail) ? 'admin' : 'vendor';
      session.vendorId = vendorId;
      session.userName = name;
      session.userEmail = normalizedEmail;
      
      // Generate signed auth token
      const authToken = generateAuthToken(normalizedEmail);
      
      res.json({
        email: normalizedEmail,
        name,
        vendorId,
        authToken,
      });
    } catch (error) {
      console.error("Email login error:", error);
      res.status(500).json({ error: "Erro no login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const session = (req as any).session;
    session.destroy?.();
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    const session = (req as any).session;
    if (!session?.userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      vendorId: user.vendorId 
    });
  });

  // User management (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      res.json(usersList.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const { email, password, name, role, vendorId } = req.body;
      const hashedPw = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPw,
        name,
        role: role || 'vendor',
        vendorId: vendorId || null,
        isActive: true,
      });
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { password, ...data } = req.body;
      
      const updateData: any = { ...data };
      if (password) {
        updateData.password = await hashPassword(password);
      }
      
      const user = await storage.updateUser(id, updateData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Erro ao excluir usuário" });
    }
  });

  // Serve the hero image for email
  app.get("/email-assets/hero-image.png", (req, res) => {
    const imagePath = path.join(process.cwd(), "attached_assets", "image_1759890107941.png");
    res.sendFile(imagePath);
  });

  // Get all registrations
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Erro ao buscar inscrições" });
    }
  });

  // Get all event registrations from Google Sheets
  app.get("/api/event-registrations", async (req, res) => {
    try {
      const registrations = await getAllEventRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ error: "Erro ao buscar inscrições do evento" });
    }
  });

  const eventRegistrationSchema = z.object({
    name: z.string().min(3),
    phone: z.string().min(10),
    linkedin: z.string().url(),
    hasCertification: z.enum(["sim", "nao"]),
    boardCount: z.string().min(1),
    interests: z.string().min(10),
  });

  app.post("/api/event-registrations", async (req, res) => {
    try {
      const validatedData = eventRegistrationSchema.parse(req.body);
      
      const timestamp = new Date().toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const eventRegistration: EventRegistration = {
        timestamp,
        name: validatedData.name,
        phone: validatedData.phone,
        linkedin: validatedData.linkedin,
        hasCertification: validatedData.hasCertification === "sim" ? "Sim" : "Não",
        boardCount: validatedData.boardCount,
        interests: validatedData.interests,
      };

      console.log("Adding registration to Google Sheets:", eventRegistration);
      
      try {
        await addEventRegistration(eventRegistration);
        console.log("Successfully added to Google Sheets");
      } catch (sheetsError: any) {
        console.error("Google Sheets error:", sheetsError);
        console.error("Error details:", JSON.stringify(sheetsError, null, 2));
        throw sheetsError;
      }

      res.status(201).json({ 
        success: true,
        message: "Inscrição registrada com sucesso"
      });
    } catch (error: any) {
      console.error("Event registration error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro ao processar inscrição" 
      });
    }
  });

  // Test email endpoint (admin only)
  app.post("/api/test-email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }
      await sendTestEmail(email);
      res.json({ success: true, message: `Email de teste enviado para ${email}` });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ 
        error: "Erro ao enviar email de teste", 
        details: error.message || String(error)
      });
    }
  });

  // Temporary endpoint to export all CRM data (vendors, leads, activities, follow-ups)
  app.get("/api/export-crm-data", async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      const leads = await storage.getAllLeads();
      const activities = await storage.getAllLeadActivities();
      const followUps = await storage.getAllLeadFollowUps();
      
      res.json({
        success: true,
        data: {
          vendors,
          leads,
          activities,
          followUps
        },
        counts: {
          vendors: vendors.length,
          leads: leads.length,
          activities: activities.length,
          followUps: followUps.length
        }
      });
    } catch (error: any) {
      console.error("Error exporting CRM data:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  // Temporary endpoint to import CRM data (call with POST and JSON body from export)
  app.post("/api/import-crm-data", async (req, res) => {
    try {
      const { vendors, leads, activities, followUps } = req.body.data || req.body;
      const results = {
        vendors: { imported: 0, skipped: 0 },
        leads: { imported: 0, skipped: 0 },
        activities: { imported: 0, skipped: 0 },
        followUps: { imported: 0, skipped: 0 }
      };

      // Import vendors first (leads reference them)
      if (vendors && Array.isArray(vendors)) {
        for (const vendor of vendors) {
          const existing = await storage.getVendorByEmail(vendor.email);
          if (existing) {
            results.vendors.skipped++;
          } else {
            await storage.createVendor({
              name: vendor.name,
              email: vendor.email,
              isActive: vendor.isActive ?? vendor.is_active ?? true
            });
            results.vendors.imported++;
          }
        }
      }

      // Import leads
      if (leads && Array.isArray(leads)) {
        for (const lead of leads) {
          const existing = await storage.getLeadByEmail(lead.email);
          if (existing) {
            results.leads.skipped++;
          } else {
            await storage.createLead({
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              linkedin: lead.linkedin,
              sheetRowId: lead.sheetRowId ?? lead.sheet_row_id,
              status: lead.status,
              temperature: lead.temperature,
              score: lead.score,
              vendorId: lead.vendorId ?? lead.vendor_id,
              aiSummary: lead.aiSummary ?? lead.ai_summary,
              registrationId: lead.registrationId ?? lead.registration_id,
              surveyResponses: lead.surveyResponses ?? lead.survey_responses,
              scoreBreakdown: lead.scoreBreakdown ?? lead.score_breakdown
            });
            results.leads.imported++;
          }
        }
      }

      // Import activities
      if (activities && Array.isArray(activities)) {
        for (const activity of activities) {
          await storage.createLeadActivity({
            leadId: activity.leadId ?? activity.lead_id,
            vendorId: activity.vendorId ?? activity.vendor_id,
            type: activity.type,
            content: activity.content,
            aiAnalysis: activity.aiAnalysis ?? activity.ai_analysis,
            scoreChange: activity.scoreChange ?? activity.score_change ?? 0
          });
          results.activities.imported++;
        }
      }

      // Import follow-ups
      if (followUps && Array.isArray(followUps)) {
        for (const followUp of followUps) {
          const scheduledAtValue = followUp.scheduledAt ?? followUp.scheduled_at;
          await storage.createLeadFollowUp({
            leadId: followUp.leadId ?? followUp.lead_id,
            vendorId: followUp.vendorId ?? followUp.vendor_id,
            type: followUp.type,
            description: followUp.description,
            scheduledAt: scheduledAtValue ? new Date(scheduledAtValue) : new Date()
          });
          results.followUps.imported++;
        }
      }

      res.json({ success: true, results });
    } catch (error: any) {
      console.error("Error importing CRM data:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  // Temporary endpoint to send bulk emails to specific registrations
  app.post("/api/send-bulk-emails", async (req, res) => {
    const results: { name: string; email: string; status: string; error?: string }[] = [];
    
    // List of registrations provided by user
    const registrations = [
      { name: "Marcos Argachoy", email: "marcos.argachoy@outlook.com.br", paymentStatus: "pago", paymentMethod: "installments" as const },
      { name: "Katya Mangili", email: "kmmangili@gmail.com", paymentStatus: "parcial", paymentMethod: "pix" as const },
      { name: "Helder Waiandt", email: "h.waiandt@uptecsolutions.com", paymentStatus: "pago", paymentMethod: "pix" as const },
      { name: "Paulo Figueiredo Neves", email: "psfn2000@gmail.com", paymentStatus: "pendente", paymentMethod: "installments" as const },
      { name: "Fábio Ricardo Geremias", email: "ffr.geremias@gmail.com", paymentStatus: "pendente", paymentMethod: "installments" as const },
      { name: "Denys Emilio Nicolosi", email: "denys@wietech.com.br", paymentStatus: "pendente", paymentMethod: "installments" as const },
    ];

    for (const reg of registrations) {
      try {
        if (reg.paymentStatus === "pago") {
          await sendPaidConfirmationEmail(reg.email, reg.name);
          results.push({ name: reg.name, email: reg.email, status: "Enviado - Confirmação de Pagamento" });
        } else if (reg.paymentStatus === "parcial") {
          await sendPartialPaymentEmail(reg.email, reg.name, reg.paymentMethod);
          results.push({ name: reg.name, email: reg.email, status: "Enviado - Lembrete Pagamento Parcial" });
        } else {
          await sendPendingPaymentEmail(reg.email, reg.name, reg.paymentMethod);
          results.push({ name: reg.name, email: reg.email, status: "Enviado - Instruções de Pagamento" });
        }
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Error sending email to ${reg.email}:`, error);
        results.push({ name: reg.name, email: reg.email, status: "Erro", error: error.message || String(error) });
      }
    }

    res.json({ success: true, results });
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Validate razaoSocial is required for CNPJ (14+ digits)
      const cpfCnpjDigits = validatedData.cpfCnpj.replace(/\D/g, '');
      if (cpfCnpjDigits.length >= 14 && !validatedData.razaoSocial?.trim()) {
        return res.status(400).json({ 
          error: "Razão Social é obrigatória para CNPJ" 
        });
      }
      
      // Block test emails and specific admin email
      if (validatedData.email.endsWith('@test.com') || 
          validatedData.email === 'marcelo.murilo.silva@gmail.com') {
        console.log(`Blocked registration attempt from: ${validatedData.email}`);
        return res.status(400).json({ 
          error: "Email não permitido para registro" 
        });
      }
      
      const existingRegistration = await storage.getRegistrationByEmail(validatedData.email);
      if (existingRegistration) {
        return res.status(400).json({ 
          error: "Este email já foi cadastrado" 
        });
      }

      const registration = await storage.createRegistration(validatedData);

      // Try to find and convert matching lead by phone
      try {
        const matchingLead = await storage.findLeadByPhone(validatedData.phone);
        if (matchingLead && matchingLead.status !== 'convertido') {
          await storage.convertLead(matchingLead.id, registration.id);
          console.log(`Lead ${matchingLead.name} (${matchingLead.id}) marked as converted for registration ${registration.id}`);
        }
      } catch (leadError) {
        console.error("Error matching lead:", leadError);
        // Don't fail registration if lead matching fails
      }

      try {
        await sendRegistrationEmail(
          registration.email,
          registration.name,
          registration.paymentMethod as "pix" | "installments" | "installments10"
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(502).json({ 
          error: "Inscrição registrada, mas houve um erro ao enviar o email de confirmação. Por favor, entre em contato conosco.",
          registration: {
            id: registration.id,
            name: registration.name,
            email: registration.email,
            paymentMethod: registration.paymentMethod
          }
        });
      }

      // Send notification to admin (contato@marcelomurilo.com.br)
      try {
        await sendRegistrationNotificationEmail({
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          paymentMethod: registration.paymentMethod,
        });
      } catch (notificationError) {
        console.error("Error sending notification email:", notificationError);
        // Don't fail the registration if notification email fails
      }

      // Send complete registration list to all admins
      try {
        const allRegistrations = await storage.getAllRegistrations();
        await sendRegistrationListEmail(allRegistrations);
      } catch (adminEmailError) {
        console.error("Error sending admin email:", adminEmailError);
        // Don't fail the registration if admin email fails
      }

      res.status(201).json({ 
        success: true, 
        registration: {
          id: registration.id,
          name: registration.name,
          email: registration.email,
          paymentMethod: registration.paymentMethod
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro ao processar inscrição" 
      });
    }
  });

  // Manual registration by vendors (authenticated)
  const manualRegistrationSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    cpfCnpj: z.string().min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos"),
    razaoSocial: z.string().optional().nullable(),
    paymentMethod: z.enum(["pix", "installments", "installments10"]),
    paymentStatus: z.enum(["pendente", "parcial", "pago"]),
    totalAmount: z.number().min(100, "Valor total deve ser pelo menos R$ 100"),
    paidAmount: z.number().min(0),
    observations: z.string().optional().nullable(),
    turma: z.enum(["turma_2", "turma_3", "turma_4"]).default("turma_3"),
    leadId: z.string().optional().nullable(),
  }).refine((data) => {
    // Validate payment status coherence
    if (data.paymentStatus === 'pago' && data.paidAmount < data.totalAmount) {
      return false;
    }
    if (data.paymentStatus === 'pendente' && data.paidAmount > 0) {
      return false;
    }
    if (data.paidAmount > data.totalAmount) {
      return false;
    }
    return true;
  }, {
    message: "Status de pagamento não corresponde ao valor pago"
  });

  // Extended schema with auth token for session-less authentication
  const manualRegistrationSchemaWithAuth = manualRegistrationSchema.and(z.object({
    authToken: z.string().optional(),
  }));

  app.post("/api/registrations/manual", async (req, res) => {
    try {
      const validatedData = manualRegistrationSchemaWithAuth.parse(req.body);
      
      // Try session-based auth first
      const session = (req as any).session;
      let vendorName = 'Admin';
      let vendorId: string | null = null;
      let isAuthenticated = false;
      
      if (session?.userId) {
        // Session auth works - get user info from session
        isAuthenticated = true;
        if (session.vendorId) {
          const vendor = await storage.getVendor(session.vendorId);
          if (vendor) {
            vendorName = vendor.name;
            vendorId = vendor.id;
          }
        } else if (session.userName) {
          vendorName = session.userName;
        }
      } else if (validatedData.authToken) {
        // Fallback: verify signed token (for production where sessions may not work)
        const tokenResult = verifyAuthToken(validatedData.authToken);
        if (!tokenResult.valid) {
          return res.status(401).json({ error: "Token inválido ou expirado" });
        }
        
        const authenticatedEmail = tokenResult.email.toLowerCase();
        
        // Check if it's a vendor
        const vendor = await storage.getVendorByEmail(authenticatedEmail);
        if (vendor && vendor.isActive) {
          vendorName = vendor.name;
          vendorId = vendor.id;
          isAuthenticated = true;
        } else {
          // Check if it's an admin email
          const ADMIN_EMAILS = ["contato@marcelomurilo.com.br", "marcelo@marcelomurilo.com.br", "hamilton@opes.com.br"];
          if (ADMIN_EMAILS.includes(authenticatedEmail)) {
            vendorName = 'Admin';
            isAuthenticated = true;
          }
        }
      }
      
      if (!isAuthenticated) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      
      // Check if email already exists
      const existingRegistration = await storage.getRegistrationByEmail(validatedData.email);
      if (existingRegistration) {
        return res.status(400).json({ 
          error: "Este email já foi cadastrado" 
        });
      }
      
      const registration = await storage.createManualRegistration({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        cpfCnpj: validatedData.cpfCnpj,
        razaoSocial: validatedData.razaoSocial,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentStatus,
        totalAmount: validatedData.totalAmount,
        paidAmount: validatedData.paidAmount,
        observations: validatedData.observations,
        turma: validatedData.turma || 'turma_3',
        leadId: validatedData.leadId,
        vendor: vendorName,
      });
      
      // Log the activity only if it's a vendor (admin actions are not logged to vendor_activity_log)
      if (vendorId) {
        await storage.logVendorAction({
          vendorId: vendorId,
          vendorName: vendorName,
          actionType: 'manual_registration',
          actionDescription: `Cadastrou manualmente a inscrição de ${validatedData.name} (${validatedData.email})`,
          metadata: JSON.stringify({
            registrationId: registration.id,
            totalAmount: validatedData.totalAmount,
            paymentStatus: validatedData.paymentStatus,
          }),
        });
      }
      
      // If linked to a lead, update the lead status to converted
      if (validatedData.leadId) {
        try {
          await storage.convertLead(validatedData.leadId, registration.id);
        } catch (leadError) {
          console.error("Error updating lead:", leadError);
        }
      } else {
        // Try to find matching lead by phone if not explicitly linked
        try {
          const matchingLead = await storage.findLeadByPhone(validatedData.phone);
          if (matchingLead && matchingLead.status !== 'convertido') {
            await storage.convertLead(matchingLead.id, registration.id);
            console.log(`Lead ${matchingLead.name} (${matchingLead.id}) marked as converted for manual registration ${registration.id}`);
          }
        } catch (leadError) {
          console.error("Error matching lead by phone:", leadError);
        }
      }
      
      res.status(201).json({ 
        success: true, 
        registration: {
          id: registration.id,
          name: registration.name,
          email: registration.email,
          paymentMethod: registration.paymentMethod,
          totalAmount: registration.totalAmount,
          paidAmount: registration.paidAmount,
          paymentStatus: registration.paymentStatus,
        }
      });
    } catch (error: any) {
      console.error("Manual registration error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro ao processar inscrição manual" 
      });
    }
  });

  // Delete a registration
  app.delete("/api/registrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRegistration(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      res.json({ success: true, message: "Inscrição excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting registration:", error);
      res.status(500).json({ error: "Erro ao excluir inscrição" });
    }
  });

  // Batch configuration for pricing
  const BATCH_PRICING = [
    { batch: 1, pixPrice: 8000, installmentTotal: 8875, installment10Total: 8875 },
    { batch: 2, pixPrice: 8700, installmentTotal: 9650, installment10Total: 9650 },
    { batch: 3, pixPrice: 9400, installmentTotal: 10425, installment10Total: 11000 },
  ];

  // Update payment received status (legacy - now also updates paidAmount correctly)
  app.patch("/api/registrations/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { received } = req.body;
      
      if (typeof received !== 'boolean') {
        return res.status(400).json({ error: "Campo 'received' deve ser boolean" });
      }
      
      // Get registration to calculate correct amounts
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      // Calculate correct total based on batch and payment method
      const batchConfig = BATCH_PRICING.find(b => b.batch === (registration.batch || 1)) || BATCH_PRICING[0];
      const isPix = registration.paymentMethod === 'pix';
      const is10x = registration.paymentMethod === 'installments10';
      const totalAmount = isPix ? batchConfig.pixPrice : (is10x ? batchConfig.installment10Total : batchConfig.installmentTotal);
      
      // When marking as paid, set paidAmount to totalAmount (in centavos)
      // When marking as not paid, set paidAmount to 0
      const paidAmount = received ? totalAmount * 100 : 0;
      const paymentStatus = received ? 'pago' : 'pendente';
      
      const updated = await storage.updatePaymentStatus(id, {
        paymentStatus,
        paidAmount,
        totalAmount,
        remainingPaymentDate: null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Erro ao atualizar status de pagamento" });
    }
  });

  // Update payment status with full details (PIX and installments)
  app.patch("/api/registrations/:id/payment-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, paidAmount, totalAmount, remainingPaymentDate } = req.body;
      
      // Validate payment status
      if (!['pendente', 'pago', 'parcial'].includes(paymentStatus)) {
        return res.status(400).json({ error: "Status de pagamento inválido" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      // Use provided totalAmount or existing registration totalAmount
      const effectiveTotal = totalAmount || registration.totalAmount || 8000;
      let validatedPaidAmount = 0;

      // Validate partial payment fields
      if (paymentStatus === 'parcial') {
        const paidNum = Number(paidAmount);
        if (isNaN(paidNum) || paidNum <= 0 || paidNum >= effectiveTotal) {
          return res.status(400).json({ error: "Valor pago deve ser maior que 0 e menor que o total" });
        }
        validatedPaidAmount = paidNum;
      } else if (paymentStatus === 'pago') {
        // When marked as 'pago', paidAmount should equal totalAmount (in centavos)
        // effectiveTotal is in reais, convert to centavos for paidAmount
        validatedPaidAmount = effectiveTotal * 100;
      }
      
      const updated = await storage.updatePaymentStatus(id, {
        paymentStatus,
        paidAmount: validatedPaidAmount,
        totalAmount: effectiveTotal,
        remainingPaymentDate: paymentStatus === 'parcial' && remainingPaymentDate ? new Date(remainingPaymentDate) : null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Erro ao atualizar status de pagamento" });
    }
  });

  // Update vendor only (batch is calculated automatically from date)
  app.patch("/api/registrations/:id/vendor", async (req, res) => {
    try {
      const { id } = req.params;
      const { vendor } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateVendor(id, {
        vendor: vendor?.trim() || null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Erro ao atualizar vendedor" });
    }
  });

  // Update observations
  app.patch("/api/registrations/:id/observations", async (req, res) => {
    try {
      const { id } = req.params;
      const { observations } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateObservations(id, {
        observations: observations?.trim() || null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating observations:", error);
      res.status(500).json({ error: "Erro ao atualizar observações" });
    }
  });

  // Update invoice status
  app.patch("/api/registrations/:id/invoice", async (req, res) => {
    try {
      const { id } = req.params;
      const { invoiceIssued, invoiceIssuedAt, invoices } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateInvoice(id, {
        invoiceIssued: Boolean(invoiceIssued),
        invoiceIssuedAt: invoiceIssued && invoiceIssuedAt ? new Date(invoiceIssuedAt) : null,
        invoices: invoices || null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Erro ao atualizar NF" });
    }
  });

  // Update vendor commission payment
  app.patch("/api/registrations/:id/vendor-commission", async (req, res) => {
    try {
      const { id } = req.params;
      const { vendorCommissionPaid, vendorCommissionPaidAt } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateVendorCommission(id, {
        vendorCommissionPaid: Number(vendorCommissionPaid) || 0,
        vendorCommissionPaidAt: vendorCommissionPaid > 0 && vendorCommissionPaidAt ? new Date(vendorCommissionPaidAt) : null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating vendor commission:", error);
      res.status(500).json({ error: "Erro ao atualizar comissão do vendedor" });
    }
  });

  // Update Hamilton payment (mentor transfer)
  app.patch("/api/registrations/:id/hamilton-payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { hamiltonPaid, hamiltonPaidAt } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateHamiltonPayment(id, {
        hamiltonPaid: Number(hamiltonPaid) || 0,
        hamiltonPaidAt: hamiltonPaid > 0 && hamiltonPaidAt ? new Date(hamiltonPaidAt) : null,
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating Hamilton payment:", error);
      res.status(500).json({ error: "Erro ao atualizar repasse de Hamilton" });
    }
  });

  // Update batch (manual override)
  app.patch("/api/registrations/:id/batch", async (req, res) => {
    try {
      const { id } = req.params;
      const { batch } = req.body;
      
      if (![1, 2, 3, 4].includes(Number(batch))) {
        return res.status(400).json({ error: "Lote deve ser 1, 2, 3 ou 4" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateBatch(id, {
        batch: Number(batch),
      });
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating batch:", error);
      res.status(500).json({ error: "Erro ao atualizar lote" });
    }
  });

  // Batch pricing configuration
  const BATCH_CONFIG = [
    { batch: 1, pixPrice: 8000, installmentPrice: 1775, installments: 5, installmentTotal: 8875, paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-hsK0gB3GT-8875,00", installment10Price: 1775, installment10Total: 8875, paymentLink10: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-hsK0gB3GT-8875,00" },
    { batch: 2, pixPrice: 8700, installmentPrice: 1930, installments: 5, installmentTotal: 9650, paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-1PkHomyUfx-9650,00", installment10Price: 1930, installment10Total: 9650, paymentLink10: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-1PkHomyUfx-9650,00" },
    { batch: 3, pixPrice: 9400, installmentPrice: 2085, installments: 5, installmentTotal: 10425, paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-2MFeYRgzrV-10425,00", installment10Price: 1100, installment10Total: 11000, paymentLink10: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLUEtSQ-Ibhdhr95b-11000,00" },
    { batch: 4, pixPrice: 10000, installmentPrice: 1000, installments: 10, installmentTotal: 10000, paymentLink: "", installment10Price: 1000, installment10Total: 10000, paymentLink10: "" },
  ];

  // Generate contract PDF for a registration (authenticated users - admin or vendor)
  app.get("/api/registrations/:id/contract-pdf", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const isPix = registration.paymentMethod === 'pix';
      const batchConfig = BATCH_CONFIG.find(b => b.batch === (registration.batch || 1)) || BATCH_CONFIG[0];
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 }
      });
      
      // Set response headers for PDF download
      const sanitizedName = registration.name.replace(/[^a-zA-Z0-9]/g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Contrato_Mentoria_${sanitizedName}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Helper function to add section title
      const addSectionTitle = (title: string) => {
        doc.font('Helvetica-Bold').fontSize(11).text(title);
        doc.moveDown(0.3);
      };
      
      // Helper function to add paragraph
      const addParagraph = (text: string, indent = false) => {
        doc.font('Helvetica').fontSize(9);
        if (indent) {
          doc.text(text, { indent: 20 });
        } else {
          doc.text(text);
        }
      };
      
      // Helper to check page break
      const checkPageBreak = (neededSpace = 100) => {
        if (doc.y > 700) {
          doc.addPage();
        }
      };
      
      // ==================== PAGE 1 - HEADER AND QUALIFICATION ====================
      
      // Header - Program title
      doc.fontSize(14).font('Helvetica-Bold')
         .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA CONJUNTA', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica')
         .text('Marcelo Murilo & Hamilton Felix', { align: 'center' });
      
      doc.moveDown(1.5);
      
      // QUALIFICAÇÃO DAS PARTES
      addSectionTitle('QUALIFICAÇÃO DAS PARTES');
      doc.moveDown(0.5);
      
      // MENTORADO(A)
      doc.font('Helvetica-Bold').fontSize(10).text('MENTORADO(A):');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Nome Completo: ${registration.name}`);
      doc.text(`CPF: ${registration.cpfCnpj}                    E-mail: ${registration.email}                    Telefone: ${registration.phone}`);
      if (registration.razaoSocial) {
        doc.text(`Razão Social: ${registration.razaoSocial}`);
      }
      
      doc.moveDown(1);
      
      // MENTORES
      doc.font('Helvetica-Bold').fontSize(10).text('MENTORES:');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      doc.text('OPES INFORMATICA LTDA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob nº 17.840.516/0001-47, com sede na Rua Afonso Pena nº 384, Florianópolis, Santa Catarina/SC, CEP 88.070.650, neste ato representada por seu Administrador nos termos do Contrato Social, MARCELO MURILO SILVA, portador do RG nº 1.663.196-0 e do CPF/MF 753.118.289-00, residente e domiciliado na Alameda Cambará 829, Santana de Parnaíba, São Paulo/SP, CEP 06539-040, e-mail: contato@marcelomurilo.com.br, Conselheiro de Administração certificado pelo IBGC, especialista em governança corporativa e conselhos empresariais, com mais de 30 anos de experiência como diretor e executivo em multinacionais dos setores de tecnologia, seguros e financeiro, doravante designado MENTOR.');
      
      doc.moveDown(0.5);
      
      doc.text('HAMILTON FERREIRA FELIX, brasileiro, empresário, casado, portador do RG nº 10024242-9 e do CPF/MF 047.886.747-69, residente e domiciliado na SHIN QL12 Quadra 4 Casa 2, Lago Norte, Brasília/DF, CEP 73.252-245, CEO, Conselheiro, Investidor e Mentor, especialista em governança corporativa, crescimento e longevidade empresarial, com mais de 30 anos de experiência em desenvolvimento de negócios e vendas em TI e Consultoria na América Latina, doravante designado COMENTOR.');
      
      doc.moveDown(1.5);
      
      // ESCOLHA DO PLANO DE MENTORIA
      addSectionTitle('ESCOLHA DO PLANO DE MENTORIA');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      doc.text('Marque com um "X" uma das opções abaixo:');
      doc.moveDown(0.5);
      
      // Plan options with checkbox - using dynamic values from batch
      const pixChecked = isPix ? '[X]' : '[  ]';
      const cardChecked = !isPix ? '[X]' : '[  ]';
      
      // Format currency helper
      const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formatCurrencyWord = (value: number) => {
        const words: Record<number, string> = {
          8000: 'oito mil reais',
          8700: 'oito mil e setecentos reais',
          8875: 'oito mil oitocentos e setenta e cinco reais',
          9400: 'nove mil e quatrocentos reais',
          9650: 'nove mil seiscentos e cinquenta reais',
          10425: 'dez mil quatrocentos e vinte e cinco reais',
          1775: 'mil setecentos e setenta e cinco reais',
          1930: 'mil novecentos e trinta reais',
          2085: 'dois mil e oitenta e cinco reais',
        };
        return words[value] || `${formatCurrency(value)} reais`;
      };
      
      doc.font('Helvetica-Bold').text(`${pixChecked} Plano P1 - Mentoria Conjunta à Vista (Lote ${batchConfig.batch})`);
      doc.font('Helvetica').text(`R$ ${formatCurrency(batchConfig.pixPrice)} (pagamento único via PIX) – 12 Sessões remotas em grupo de uma hora, semanais.`);
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text(`${cardChecked} Plano P2 - Mentoria Conjunta Parcelada (Lote ${batchConfig.batch})`);
      doc.font('Helvetica').text(`${batchConfig.installments}x R$ ${formatCurrency(batchConfig.installmentPrice)} sem juros (Total: R$ ${formatCurrency(batchConfig.installmentTotal)}) - 12 Sessões remotas em grupo de uma hora, semanais.`);
      
      doc.moveDown(0.8);
      
      doc.font('Helvetica-Bold').text('Turma de Mentoria:');
      doc.font('Helvetica').text('TURMA 2 – Fevereiro a Abril de 2026, as segundas feiras das 19h às 21h.');
      
      doc.moveDown(1);
      
      doc.font('Helvetica').fontSize(9).text('As partes acima qualificadas firmam o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA CONJUNTA, mediante as seguintes cláusulas e condições:');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA PRIMEIRA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA PRIMEIRA – DO OBJETO');
      addParagraph('O presente contrato tem por objeto a prestação de serviços de mentoria conjunta para transição da carreira executiva para a de conselheiro e criação de novos conselhos pelos MENTORES ao MENTORADO(A), conforme o plano escolhido acima, visando o desenvolvimento de competências, habilidades de liderança e conhecimentos necessários.');
      doc.moveDown(0.3);
      addParagraph('Parágrafo Primeiro – A mentoria será ministrada pelos MENTORES Marcelo Murilo Silva e Hamilton Felix, especialistas em governança corporativa e desenvolvimento de conselhos.');
      doc.moveDown(0.3);
      addParagraph('Parágrafo Segundo – O programa é composto por dois módulos:');
      addParagraph('Módulo 1 - Transição para Conselhos (8 horas): Conduzido por Marcelo Murilo, abordando definição de nicho, perfil de conselheiro, criação de conteúdo, networking estratégico, vendas e aspectos práticos dos conselhos.', true);
      addParagraph('Módulo 2 - Criando Novos Conselhos (4 horas): Conduzido por Hamilton Felix, abordando prospecção de empresas, fechamento de projetos, implementação e evolução de conselhos.', true);
      doc.moveDown(0.3);
      addParagraph('Parágrafo Terceiro – IMPORTANTE: Os MENTORES esclarecem que a mentoria tem caráter educativo e de desenvolvimento profissional, NÃO HAVENDO QUALQUER GARANTIA de que o MENTORADO(A) conseguirá ingressar ou ser indicado para conselhos, uma vez que tais indicações dependem de fatores externos, networking, oportunidades de mercado e decisões de terceiros.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA SEGUNDA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA SEGUNDA – DA MODALIDADE E CRONOGRAMA');
      addParagraph('A Mentoria Conjunta da Turma 2 será realizada conforme o seguinte cronograma:');
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').fontSize(9).text('MÓDULO 1 - TRANSIÇÃO PARA CONSELHOS (Marcelo Murilo):');
      doc.font('Helvetica').fontSize(8);
      doc.text('Sessão 1 - 23/02/2026 (19h-20h): Definindo seu nicho e propósito');
      doc.text('Sessão 2 - 02/03/2026 (19h-20h): Perfil de conselheiro que vende');
      doc.text('Sessão 3 - 09/03/2026 (19h-20h): Posts que geram oportunidades');
      doc.text('Sessão 4 - 16/03/2026 (19h-20h): Interações que multiplicam alcance');
      doc.text('Sessão 5 - 23/03/2026 (19h-20h): Conectando com quem importa');
      doc.text('Sessão 6 - 30/03/2026 (19h-20h): Vendas e eventos estratégicos');
      doc.text('Sessão 7 - 06/04/2026 (19h-20h): Aspectos práticos dos conselhos');
      doc.text('Sessão 8 - 13/04/2026 (19h-20h): Integração e planejamento futuros');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(9).text('MÓDULO 2 - CRIANDO NOVOS CONSELHOS (Hamilton Felix):');
      doc.font('Helvetica').fontSize(8);
      doc.text('Sessão 9 - 20/04/2026 (19h-20h): Prospecção de empresas');
      doc.text('Sessão 10 - 20/04/2026 (20h-21h): Fechamento de Projetos');
      doc.text('Sessão 11 - 27/04/2026 (19h-20h): Implementando o Conselho');
      doc.text('Sessão 12 - 27/04/2026 (20h-21h): Evoluindo o Conselho');
      
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      addParagraph('Parágrafo Único – O tempo de tolerância para início das sessões é de no máximo 10 (dez) minutos. Caso o MENTORADO(A) não compareça neste prazo, a sessão será considerada realizada e não haverá reposição.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA TERCEIRA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA TERCEIRA – DO VALOR E CONDIÇÕES DE PAGAMENTO');
      
      // Dynamic values clause based on registration batch and payment method
      if (isPix) {
        addParagraph(`O(A) MENTORADO(A) optou pelo pagamento à vista, via PIX, no valor de R$ ${formatCurrency(batchConfig.pixPrice)} (${formatCurrencyWord(batchConfig.pixPrice)}), utilizando como chave o CNPJ da OPES INFORMATICA LTDA: 17.840.516/0001-47.`);
      } else {
        addParagraph(`O(A) MENTORADO(A) optou pelo pagamento parcelado em ${batchConfig.installments}x sem juros de R$ ${formatCurrency(batchConfig.installmentPrice)} (${formatCurrencyWord(batchConfig.installmentPrice)}), totalizando R$ ${formatCurrency(batchConfig.installmentTotal)} (${formatCurrencyWord(batchConfig.installmentTotal)}), mediante cartão de crédito, através do link de pagamento: ${batchConfig.paymentLink}`);
      }
      doc.moveDown(0.3);
      addParagraph('Este contrato somente terá validade mediante assinatura e comprovação do pagamento integral, seja à vista ou parcelado no cartão de crédito.');
      doc.moveDown(0.3);
      addParagraph('Parágrafo Primeiro – A Nota Fiscal será emitida e enviada ao(à) MENTORADO(A) em até 5 (cinco) dias úteis, no e-mail cadastrado, no valor integral da mentoria.');
      addParagraph('Parágrafo Segundo – Em caso de pagamento à vista via PIX não realizado no ato da assinatura, o contrato não terá validade e não haverá reserva de vaga na mentoria.');
      addParagraph('Parágrafo Terceiro – Em caso de parcelamento via cartão de crédito:');
      addParagraph('• O não processamento de qualquer parcela pela operadora do cartão implicará em imediata suspensão da participação do(a) MENTORADO(A) até a regularização.', true);
      addParagraph('• Se a inadimplência superar 15 (quinze) dias, o contrato será rescindido de pleno direito, sendo devido o valor proporcional às sessões realizadas, acrescido de multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês e correção monetária pelo IPCA.', true);
      addParagraph('• Caso todas as sessões já tenham sido realizadas, o valor integral será exigível, acrescido de multas, juros, correção monetária, custos de cobrança e honorários advocatícios, se for o caso.', true);
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA QUARTA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA QUARTA – DOS DIREITOS E DEVERES DOS MENTORES');
      addParagraph('São deveres dos MENTORES:');
      addParagraph('• Conduzir as sessões com excelência técnica e ética profissional', true);
      addParagraph('• Manter sigilo absoluto sobre todas as informações compartilhadas', true);
      addParagraph('• Fornecer conteúdo atualizado sobre governança corporativa e conselhos', true);
      addParagraph('• Compartilhar conhecimentos e experiências sobre o mercado de conselhos', true);
      addParagraph('• Respeitar os horários agendados e cronograma estabelecido', true);
      addParagraph('• Disponibilizar materiais de apoio quando necessário', true);
      doc.moveDown(0.3);
      addParagraph('São direitos dos MENTORES:');
      addParagraph('• Receber pontualmente os valores acordados', true);
      addParagraph('• Ter suas metodologias e propriedade intelectual respeitadas', true);
      addParagraph('• Interromper o processo em caso de comportamento inadequado do MENTORADO(A)', true);
      addParagraph('• Adaptar o conteúdo conforme necessidades identificadas', true);
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA QUINTA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA QUINTA – DOS DEVERES DO MENTORADO(A)');
      addParagraph('São deveres do MENTORADO(A):');
      addParagraph('• Comparecer pontualmente às sessões agendadas', true);
      addParagraph('• Participar ativamente do processo de mentoria', true);
      addParagraph('• Implementar as orientações e exercícios propostos', true);
      addParagraph('• Manter sigilo sobre metodologias e materiais fornecidos', true);
      addParagraph('• Efetuar os pagamentos nas datas acordadas', true);
      addParagraph('• Tratar os MENTORES e demais participantes com respeito', true);
      addParagraph('• Fornecer informações verdadeiras sobre sua situação profissional', true);
      addParagraph('• Estar disposto(a) a mudanças e desenvolvimento pessoal', true);
      addParagraph('• Compreender que a mentoria é um processo de desenvolvimento sem garantias de resultados externos', true);
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA SEXTA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA SEXTA – DA CONFIDENCIALIDADE E PROPRIEDADE INTELECTUAL');
      addParagraph('Parágrafo Primeiro – Ambas as partes se comprometem a manter absoluto sigilo sobre todas as informações trocadas durante o processo de mentoria, incluindo dados pessoais, profissionais, estratégias empresariais e metodologias aplicadas.');
      addParagraph('Parágrafo Segundo – É vedada a gravação, reprodução ou divulgação do conteúdo das sessões sem autorização expressa por escrito dos MENTORES.');
      addParagraph('Parágrafo Terceiro – Todos os materiais, metodologias, frameworks e ferramentas utilizados pelos MENTORES são de sua propriedade intelectual exclusiva, sendo vedada sua reprodução, adaptação ou comercialização pelo MENTORADO(A).');
      addParagraph('Parágrafo Quarto – O descumprimento desta cláusula implica em multa de R$ 50.000,00 (cinquenta mil reais), sem prejuízo das demais sanções legais.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA SÉTIMA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA SÉTIMA – DAS LIMITAÇÕES E RESPONSABILIDADES');
      addParagraph('Parágrafo Primeiro – Os MENTORES fornecem conhecimentos, orientações e metodologias sobre o processo de transição da carreira executiva para a de conselheiro e criação de novos conselhos, mas NÃO GARANTEM que o MENTORADO(A) conseguirá ingressar em conselhos empresariais, uma vez que isso depende de fatores como oportunidades de mercado, networking, indicações de terceiros e decisões independentes de empresas e organizações.');
      addParagraph('Parágrafo Segundo – Os MENTORES não se responsabilizam por decisões tomadas pelo MENTORADO(A) antes, durante ou após o processo de mentoria, nem por resultados obtidos em processos seletivos ou indicações para conselhos.');
      addParagraph('Parágrafo Terceiro – A mentoria não substitui formação acadêmica específica, certificações exigidas por órgãos reguladores ou experiência prática necessária para atuação em conselhos.');
      addParagraph('Parágrafo Quarto – O MENTORADO(A) declara estar em pleno gozo de suas faculdades mentais e assume total responsabilidade por suas decisões e ações decorrentes da mentoria.');
      addParagraph('Parágrafo Quinto – O sucesso do processo depende fundamentalmente do comprometimento, aplicação e networking do próprio MENTORADO(A).');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA OITAVA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA OITAVA – DA RESCISÃO');
      addParagraph('Parágrafo Primeiro – O contrato poderá ser rescindido:');
      addParagraph('• Por mútuo acordo entre as partes', true);
      addParagraph('• Por inadimplência do MENTORADO(A) superior a 30 dias', true);
      addParagraph('• Por comportamento inadequado ou desrespeitoso de qualquer das partes', true);
      addParagraph('• Por impossibilidade de continuidade do MENTORADO(A)', true);
      doc.moveDown(0.3);
      addParagraph('Parágrafo Segundo – Em caso de rescisão por iniciativa do MENTORADO(A), será devida multa correspondente a 50% do valor das sessões não realizadas.');
      addParagraph('Parágrafo Terceiro – Não haverá cobrança de multa rescisória se comprovado descumprimento contratual pelos MENTORES.');
      addParagraph('Parágrafo Quarto – A rescisão não exime o MENTORADO(A) do pagamento das sessões já realizadas e valores em atraso.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA NONA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA NONA – DA REMARCAÇÃO E CANCELAMENTO');
      addParagraph('Parágrafo Primeiro – Por se tratar de mentoria coletiva com cronograma fixo, não há possibilidade de remarcação individual de sessões.');
      addParagraph('Parágrafo Segundo – As sessões não assistidas pelo MENTORADO(A) serão consideradas realizadas, sem direito a reposição ou reembolso.');
      addParagraph('Parágrafo Terceiro – Os MENTORES poderão remarcar sessão em caso de força maior, comunicando com a maior antecedência possível e garantindo a reposição em data alternativa.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA DÉCIMA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA DÉCIMA – DO CÓDIGO DE ÉTICA');
      addParagraph('O processo de mentoria será conduzido observando-se os mais altos padrões éticos, incluindo:');
      addParagraph('• Respeito mútuo e profissionalismo', true);
      addParagraph('• Confidencialidade absoluta', true);
      addParagraph('• Foco no desenvolvimento do MENTORADO(A) para conselhos', true);
      addParagraph('• Transparência nas orientações e feedback', true);
      addParagraph('• Compromisso com a excelência dos serviços', true);
      addParagraph('• Clareza sobre limitações e ausência de garantias de colocação', true);
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA DÉCIMA PRIMEIRA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA DÉCIMA PRIMEIRA – DO FORO');
      addParagraph('As partes elegem o Foro da Comarca de São Paulo/SP para dirimir quaisquer questões decorrentes deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.');
      
      doc.moveDown(1);
      
      // ==================== CLÁUSULA DÉCIMA SEGUNDA ====================
      checkPageBreak();
      addSectionTitle('CLÁUSULA DÉCIMA SEGUNDA – DAS DISPOSIÇÕES GERAIS');
      addParagraph('Parágrafo Primeiro – Este contrato constitui o acordo integral entre as partes, revogando qualquer ajuste anterior.');
      addParagraph('Parágrafo Segundo – Alterações somente serão válidas se feitas por escrito e assinadas por ambas as partes.');
      addParagraph('Parágrafo Terceiro – A tolerância com eventual descumprimento não constituirá novação ou renúncia aos direitos.');
      addParagraph('Parágrafo Quarto – Se qualquer cláusula for considerada inválida, as demais permanecerão em vigor.');
      
      doc.moveDown(1.5);
      
      // ==================== SIGNATURES ====================
      checkPageBreak(180);
      addParagraph('E por estarem justas e acordadas, as partes assinam o presente contrato em duas vias de igual teor e forma.');
      
      doc.moveDown(1);
      
      const today = new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
      });
      
      doc.font('Helvetica').fontSize(9).text(`Local e Data: São Paulo, ${today}`);
      
      doc.moveDown(2);
      
      // Signature lines
      doc.text('_'.repeat(60), { align: 'center' });
      doc.font('Helvetica-Bold').text('MARCELO MURILO SILVA', { align: 'center' });
      doc.font('Helvetica').text('CPF: 753.118.289-00', { align: 'center' });
      doc.text('OPES INFORMATICA LTDA', { align: 'center' });
      
      doc.moveDown(1.5);
      
      doc.text('_'.repeat(60), { align: 'center' });
      doc.font('Helvetica-Bold').text('HAMILTON FERREIRA FELIX', { align: 'center' });
      doc.font('Helvetica').text('CPF: 047.886.747-69', { align: 'center' });
      doc.text('COMENTOR', { align: 'center' });
      
      doc.moveDown(1.5);
      
      doc.text('_'.repeat(60), { align: 'center' });
      doc.font('Helvetica-Bold').text('MENTORADO(A)', { align: 'center' });
      doc.font('Helvetica').text(`Nome: ${registration.name}`, { align: 'center' });
      doc.text(`CPF: ${registration.cpfCnpj}`, { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      console.error("Error generating contract PDF:", error);
      res.status(500).json({ error: "Erro ao gerar PDF do contrato" });
    }
  });

  // Analytics - Record page view
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { path, referrer, sessionId } = req.body;
      const userAgent = req.headers['user-agent'] || null;
      
      // Hash IP for privacy (don't store raw IP)
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16);
      
      await storage.createPageView({
        path,
        referrer: referrer || null,
        userAgent,
        ipHash,
        sessionId: sessionId || null,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording page view:", error);
      res.status(500).json({ error: "Erro ao registrar visita" });
    }
  });

  // Analytics - Get statistics
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      
      const [viewsByDay, viewsByPath, totalViews, uniqueVisitors] = await Promise.all([
        storage.getPageViewsByDay(days),
        storage.getPageViewsByPath(days),
        storage.getTotalPageViews(),
        storage.getUniqueVisitors(days),
      ]);
      
      res.json({
        viewsByDay,
        viewsByPath,
        totalViews,
        uniqueVisitors,
        period: days,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Database info endpoint (for debugging)
  app.get("/api/db-info", async (req, res) => {
    const dbUrl = process.env.DATABASE_URL || '';
    // Mask password but show host for identification
    const masked = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    res.json({ dbUrl: masked });
  });

  // ==================== CRM ENDPOINTS ====================

  // Auto-initialize vendors if database is empty (for production setup)
  app.post("/api/crm/init", async (req, res) => {
    try {
      const existingVendors = await storage.getAllVendors();
      
      if (existingVendors.length > 0) {
        return res.json({ message: "Já existem vendedores cadastrados", initialized: false });
      }

      // Create default vendors
      const defaultVendors = [
        { name: "Marcelo Murilo", email: "contato@marcelomurilo.com.br" },
        { name: "Hamilton Felix", email: "hamiltonfelix@gmail.com" },
        { name: "Leandro Massaneiro", email: "leandro@felixempresarial.com.br" },
      ];

      for (const vendor of defaultVendors) {
        await storage.createVendor(vendor);
      }

      console.log("CRM initialized with default vendors");
      res.json({ 
        message: "Sistema inicializado com sucesso!", 
        initialized: true,
        vendors: defaultVendors.map(v => v.name)
      });
    } catch (error) {
      console.error("Error initializing CRM:", error);
      res.status(500).json({ error: "Erro ao inicializar sistema" });
    }
  });

  // Vendors CRUD
  app.get("/api/crm/vendors", async (req, res) => {
    try {
      const vendorsList = await storage.getAllVendors();
      res.json(vendorsList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Erro ao buscar vendedores" });
    }
  });

  app.post("/api/crm/vendors", async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Erro ao criar vendedor" });
    }
  });

  app.patch("/api/crm/vendors/:id/active", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const vendor = await storage.updateVendorActive(id, isActive);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Erro ao atualizar vendedor" });
    }
  });

  // Update vendor (admin only)
  app.patch("/api/crm/vendors/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, isActive, hasCommission } = req.body;
      const vendor = await storage.updateVendorDetails(id, { name, email, isActive, hasCommission });
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Erro ao atualizar vendedor" });
    }
  });

  app.delete("/api/crm/vendors/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendor(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Erro ao excluir vendedor" });
    }
  });

  // Leads CRUD
  app.get("/api/crm/leads", async (req, res) => {
    try {
      const leadsList = await storage.getAllLeads();
      res.json(leadsList);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Erro ao buscar leads" });
    }
  });

  app.get("/api/crm/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Erro ao buscar lead" });
    }
  });

  // Sync leads from Google Sheets
  app.post("/api/crm/leads/sync", async (req, res) => {
    try {
      const surveyResponses = await fetchSurveyResponses();
      let imported = 0;
      let updated = 0;
      let skipped = 0;

      // Protected statuses that should not be overwritten during sync
      const protectedStatuses = ['mentorado', 'nao_abordar', 'convertido'];
      
      for (const response of surveyResponses) {
        // Check if lead already exists by email
        const existingLead = response.email ? await storage.getLeadByEmail(response.email) : null;
        
        // Calculate score with detailed breakdown
        const { score, temperature, breakdown } = calculateLeadScore(response.responses);
        
        // Generate summary from breakdown categories (unique, no duplicates)
        const uniqueCategories = Array.from(new Set(breakdown.map(b => b.category)));
        const aiSummary = uniqueCategories.join(', ');
        
        if (existingLead) {
          // Skip leads with protected statuses - never overwrite them
          if (protectedStatuses.includes(existingLead.status)) {
            skipped++;
            continue;
          }
          
          // Always update phone if available in sheet but not in DB
          const updateData: any = {};
          if (response.phone && !existingLead.phone) {
            updateData.phone = response.phone;
          }
          if (response.linkedin && !existingLead.linkedin) {
            updateData.linkedin = response.linkedin;
          }
          
          // Update existing lead with new score if higher
          if (score > existingLead.score) {
            updateData.score = score;
            updateData.temperature = temperature;
            updateData.surveyResponses = response.responses;
            updateData.scoreBreakdown = breakdown;
            updateData.aiSummary = aiSummary;
          }
          
          if (Object.keys(updateData).length > 0) {
            await storage.updateLead(existingLead.id, updateData);
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new lead
          await storage.createLead({
            sheetRowId: response.rowIndex,
            name: response.name || 'Sem nome',
            email: response.email || '',
            phone: response.phone || null,
            linkedin: response.linkedin || null,
            surveyResponses: response.responses,
            score,
            temperature,
            scoreBreakdown: breakdown,
            status: 'novo',
            aiSummary,
          });
          imported++;
        }
      }

      res.json({ 
        success: true, 
        imported, 
        updated, 
        skipped,
        total: surveyResponses.length 
      });
    } catch (error) {
      console.error("Error syncing leads:", error);
      res.status(500).json({ error: "Erro ao sincronizar leads: " + (error as Error).message });
    }
  });

  // Regenerate all lead profiles (recalculate scores and ai_summary)
  app.post("/api/crm/leads/regenerate", requireAdmin, async (req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      let regenerated = 0;
      let skipped = 0;

      for (const lead of allLeads) {
        // Skip leads without survey responses
        if (!lead.surveyResponses || Object.keys(lead.surveyResponses).length === 0) {
          skipped++;
          continue;
        }

        // Recalculate score with proper deduplication
        const { score, temperature, breakdown } = calculateLeadScore(lead.surveyResponses as Record<string, string>);
        
        // Generate ai_summary from unique categories only
        const uniqueCategories = Array.from(new Set(breakdown.map(b => b.category)));
        const aiSummary = uniqueCategories.join(', ');

        // Update lead with regenerated profile
        await storage.updateLead(lead.id, {
          score,
          temperature,
          scoreBreakdown: breakdown,
          aiSummary,
        });
        regenerated++;
      }

      res.json({
        success: true,
        regenerated,
        skipped,
        total: allLeads.length
      });
    } catch (error) {
      console.error("Error regenerating lead profiles:", error);
      res.status(500).json({ error: "Erro ao regenerar perfis: " + (error as Error).message });
    }
  });

  // Sync existing registrations with leads (mark matching leads as converted)
  app.post("/api/crm/leads/sync-registrations", requireAdmin, async (req, res) => {
    try {
      const allRegistrations = await storage.getAllRegistrations();
      const allLeads = await storage.getAllLeads();
      let converted = 0;
      let alreadyConverted = 0;
      let notFound = 0;

      for (const registration of allRegistrations) {
        // Skip if we don't have a phone number
        if (!registration.phone) {
          notFound++;
          continue;
        }
        
        // Find matching lead by phone
        const matchingLead = await storage.findLeadByPhone(registration.phone);
        
        if (matchingLead) {
          if (matchingLead.status === 'convertido') {
            alreadyConverted++;
          } else {
            await storage.convertLead(matchingLead.id, registration.id);
            converted++;
            console.log(`Synced: Lead ${matchingLead.name} marked as converted for registration ${registration.name}`);
          }
        } else {
          notFound++;
        }
      }

      res.json({
        success: true,
        converted,
        alreadyConverted,
        notFound,
        totalRegistrations: allRegistrations.length,
        totalLeads: allLeads.length
      });
    } catch (error) {
      console.error("Error syncing registrations with leads:", error);
      res.status(500).json({ error: "Erro ao sincronizar: " + (error as Error).message });
    }
  });

  // Update phone from Google Sheets for specific lead
  app.post("/api/crm/leads/:id/sync-phone", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado" });
      }

      // Fetch fresh data from Google Sheets
      const surveyResponses = await fetchSurveyResponses();
      const sheetLead = surveyResponses.find(r => r.email === lead.email);
      
      if (!sheetLead) {
        return res.status(404).json({ error: "Lead não encontrado na planilha" });
      }

      if (sheetLead.phone) {
        await storage.updateLead(id, { phone: sheetLead.phone });
        res.json({ success: true, phone: sheetLead.phone });
      } else {
        res.json({ success: false, message: "Telefone não encontrado na planilha" });
      }
    } catch (error) {
      console.error("Error syncing phone:", error);
      res.status(500).json({ error: "Erro ao sincronizar telefone" });
    }
  });

  // Claim/Release lead
  app.post("/api/crm/leads/:id/claim", async (req, res) => {
    try {
      const { id } = req.params;
      const { vendorId } = req.body;
      const leadBefore = await storage.getLead(id);
      const vendor = await storage.getVendor(vendorId);
      const lead = await storage.claimLead(id, vendorId);
      
      // Log activity
      await storage.createLeadActivity({
        leadId: id,
        vendorId,
        type: 'status_change',
        content: 'Lead reservado para trabalho',
        scoreChange: 0,
      });

      // Log vendor action
      await storage.logVendorAction({
        vendorId,
        vendorName: vendor?.name || 'Desconhecido',
        leadId: id,
        leadName: lead?.name || leadBefore?.name,
        actionType: 'claim_lead',
        actionDescription: `Reservou o lead "${lead?.name || leadBefore?.name}"`,
      });
      
      res.json(lead);
    } catch (error) {
      console.error("Error claiming lead:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/crm/leads/:id/release", async (req, res) => {
    try {
      const { id } = req.params;
      const leadBefore = await storage.getLead(id);
      const vendorId = leadBefore?.vendorId;
      const vendor = vendorId ? await storage.getVendor(vendorId) : null;
      const lead = await storage.releaseLead(id);
      
      // Log activity
      await storage.createLeadActivity({
        leadId: id,
        vendorId: null,
        type: 'status_change',
        content: 'Lead liberado',
        scoreChange: 0,
      });

      // Log vendor action (if there was a vendor)
      if (vendorId && vendor) {
        await storage.logVendorAction({
          vendorId,
          vendorName: vendor.name,
          leadId: id,
          leadName: leadBefore?.name,
          actionType: 'release_lead',
          actionDescription: `Liberou o lead "${leadBefore?.name}"`,
        });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error releasing lead:", error);
      res.status(500).json({ error: "Erro ao liberar lead" });
    }
  });

  // Update lead contact info (phone, linkedin)
  app.patch("/api/crm/leads/:id/contact", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { phone, linkedin } = req.body;
      
      const updateData: any = {};
      if (phone !== undefined) updateData.phone = phone;
      if (linkedin !== undefined) updateData.linkedin = linkedin;
      
      const lead = await storage.updateLead(id, updateData);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead contact:", error);
      res.status(500).json({ error: "Erro ao atualizar contato" });
    }
  });

  // Update lead status
  app.patch("/api/crm/leads/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const lead = await storage.updateLead(id, { status });
      
      // Log activity
      await storage.createLeadActivity({
        leadId: id,
        vendorId: null,
        type: 'status_change',
        content: `Status alterado para: ${status}`,
        scoreChange: 0,
      });
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ error: "Erro ao atualizar status" });
    }
  });

  // Lead Activities
  app.get("/api/crm/leads/:id/activities", async (req, res) => {
    try {
      const { id } = req.params;
      const activities = await storage.getLeadActivities(id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  });

  app.post("/api/crm/leads/:id/activities", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, content, vendorId, scoreChange } = req.body;
      
      const activity = await storage.createLeadActivity({
        leadId: id,
        vendorId: vendorId || null,
        type,
        content,
        scoreChange: scoreChange || 0,
      });

      // Log vendor action if vendor is provided
      if (vendorId) {
        const [vendor, lead] = await Promise.all([
          storage.getVendor(vendorId),
          storage.getLead(id),
        ]);
        const typeLabels: Record<string, string> = {
          'call': 'Ligação',
          'whatsapp': 'WhatsApp',
          'email': 'Email',
          'meeting': 'Reunião',
          'note': 'Nota',
          'status_change': 'Alteração de status',
        };
        await storage.logVendorAction({
          vendorId,
          vendorName: vendor?.name || 'Desconhecido',
          leadId: id,
          leadName: lead?.name,
          actionType: 'add_activity',
          actionDescription: `Registrou atividade (${typeLabels[type] || type}): "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
          metadata: JSON.stringify({ activityType: type, content }),
        });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Erro ao criar atividade" });
    }
  });

  // Delete activity (admin only)
  app.delete("/api/crm/activities/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLeadActivity(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ error: "Erro ao excluir atividade" });
    }
  });

  // Lead Follow-ups
  app.get("/api/crm/leads/:id/followups", async (req, res) => {
    try {
      const { id } = req.params;
      const followUps = await storage.getLeadFollowUps(id);
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      res.status(500).json({ error: "Erro ao buscar follow-ups" });
    }
  });

  app.get("/api/crm/followups/pending", async (req, res) => {
    try {
      const vendorId = req.query.vendorId as string | undefined;
      const followUps = await storage.getPendingFollowUps(vendorId);
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching pending follow-ups:", error);
      res.status(500).json({ error: "Erro ao buscar follow-ups pendentes" });
    }
  });

  app.post("/api/crm/leads/:id/followups", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, description, scheduledAt, vendorId } = req.body;
      
      const followUp = await storage.createLeadFollowUp({
        leadId: id,
        vendorId: vendorId || null,
        type,
        description,
        scheduledAt: new Date(scheduledAt),
      });

      // Log vendor action if vendor is provided
      if (vendorId) {
        const [vendor, lead] = await Promise.all([
          storage.getVendor(vendorId),
          storage.getLead(id),
        ]);
        const typeLabels: Record<string, string> = {
          'call': 'Ligação',
          'whatsapp': 'WhatsApp',
          'email': 'Email',
          'meeting': 'Reunião',
        };
        await storage.logVendorAction({
          vendorId,
          vendorName: vendor?.name || 'Desconhecido',
          leadId: id,
          leadName: lead?.name,
          actionType: 'create_followup',
          actionDescription: `Agendou follow-up (${typeLabels[type] || type}) para ${new Date(scheduledAt).toLocaleDateString('pt-BR')}: "${description.substring(0, 80)}${description.length > 80 ? '...' : ''}"`,
          metadata: JSON.stringify({ followUpType: type, scheduledAt, description }),
        });
      }
      
      res.json(followUp);
    } catch (error) {
      console.error("Error creating follow-up:", error);
      res.status(500).json({ error: "Erro ao criar follow-up" });
    }
  });

  app.patch("/api/crm/followups/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      
      const followUp = await storage.completeFollowUp(id);

      if (!followUp) {
        return res.status(404).json({ error: "Follow-up não encontrado" });
      }

      // Log vendor action if vendor was assigned
      if (followUp.vendorId) {
        const [vendor, lead] = await Promise.all([
          storage.getVendor(followUp.vendorId),
          storage.getLead(followUp.leadId),
        ]);
        const typeLabels: Record<string, string> = {
          'call': 'Ligação',
          'whatsapp': 'WhatsApp',
          'email': 'Email',
          'meeting': 'Reunião',
        };
        await storage.logVendorAction({
          vendorId: followUp.vendorId,
          vendorName: vendor?.name || 'Desconhecido',
          leadId: followUp.leadId,
          leadName: lead?.name,
          actionType: 'complete_followup',
          actionDescription: `Concluiu follow-up (${typeLabels[followUp.type] || followUp.type}): "${followUp.description.substring(0, 80)}${followUp.description.length > 80 ? '...' : ''}"`,
        });
      }

      res.json(followUp);
    } catch (error) {
      console.error("Error completing follow-up:", error);
      res.status(500).json({ error: "Erro ao completar follow-up" });
    }
  });

  app.delete("/api/crm/followups/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFollowUp(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting follow-up:", error);
      res.status(500).json({ error: "Erro ao excluir follow-up" });
    }
  });

  // AI Suggestions for lead interactions
  app.get("/api/crm/leads/:id/ai-suggestions", async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado" });
      }

      const activities = await storage.getLeadActivities(id);
      
      // Generate AI suggestions based on lead profile and history
      const suggestions = generateAISuggestions(lead, activities);
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ error: "Erro ao gerar sugestões" });
    }
  });

  // Converted leads with registration details
  app.get("/api/crm/leads/converted", async (req, res) => {
    try {
      const convertedLeads = await storage.getConvertedLeadsWithRegistrations();
      res.json(convertedLeads);
    } catch (error) {
      console.error("Error fetching converted leads:", error);
      res.status(500).json({ error: "Erro ao buscar leads convertidos" });
    }
  });

  // Vendor Activity Log endpoints (admin only)
  app.get("/api/crm/vendor-activity", requireAdmin, async (req, res) => {
    try {
      const { vendorId, startDate, endDate, actionType, limit, offset } = req.query;
      
      const filters: any = {};
      if (vendorId && vendorId !== 'all') filters.vendorId = vendorId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (actionType && actionType !== 'all') filters.actionType = actionType as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const result = await storage.getVendorActivityLogs(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching vendor activity logs:", error);
      res.status(500).json({ error: "Erro ao buscar logs de atividades" });
    }
  });

  app.get("/api/crm/vendor-activity/summary", requireAdmin, async (req, res) => {
    try {
      const { vendorId, days } = req.query;
      const summary = await storage.getVendorActivitySummary(
        vendorId as string | undefined,
        days ? parseInt(days as string) : 7
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching vendor activity summary:", error);
      res.status(500).json({ error: "Erro ao buscar resumo de atividades" });
    }
  });

  // Commission Payments routes
  app.get("/api/commission-payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getCommissionPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching commission payments:", error);
      res.status(500).json({ error: "Erro ao buscar pagamentos de comissões" });
    }
  });

  app.get("/api/commission-payments/by-registration/:registrationId", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getCommissionPaymentsByRegistration(req.params.registrationId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching commission payments by registration:", error);
      res.status(500).json({ error: "Erro ao buscar pagamentos" });
    }
  });

  app.get("/api/commission-payments/by-recipient/:type", requireAdmin, async (req, res) => {
    try {
      const { recipientId } = req.query;
      const payments = await storage.getCommissionPaymentsByRecipient(
        req.params.type,
        recipientId as string | undefined
      );
      res.json(payments);
    } catch (error) {
      console.error("Error fetching commission payments by recipient:", error);
      res.status(500).json({ error: "Erro ao buscar pagamentos" });
    }
  });

  app.post("/api/commission-payments", requireAdmin, async (req, res) => {
    try {
      const payment = await storage.createCommissionPayment(req.body);
      res.json(payment);
    } catch (error) {
      console.error("Error creating commission payment:", error);
      res.status(500).json({ error: "Erro ao criar pagamento de comissão" });
    }
  });

  app.post("/api/commission-payments/:id/pay", requireAdmin, async (req, res) => {
    try {
      const { amount, paymentMethod, notes, paidBy } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
      }
      const entry = await storage.addCommissionPaymentEntry(
        req.params.id,
        amount,
        paymentMethod,
        notes,
        paidBy
      );
      res.json(entry);
    } catch (error) {
      console.error("Error adding commission payment entry:", error);
      res.status(500).json({ error: "Erro ao registrar pagamento" });
    }
  });

  app.get("/api/commission-payments/:id/history", requireAdmin, async (req, res) => {
    try {
      const history = await storage.getCommissionPaymentHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching commission payment history:", error);
      res.status(500).json({ error: "Erro ao buscar histórico de pagamentos" });
    }
  });

  app.delete("/api/commission-payments/history/:historyId", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCommissionPaymentEntry(req.params.historyId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Registro não encontrado" });
      }
    } catch (error) {
      console.error("Error deleting commission payment entry:", error);
      res.status(500).json({ error: "Erro ao excluir registro de pagamento" });
    }
  });

  app.get("/api/financial-summary", requireAdmin, async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ error: "Erro ao buscar resumo financeiro" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI Suggestions generator based on lead context
function generateAISuggestions(lead: any, activities: any[]): { nextSteps: string[]; arguments: string[]; status: string } {
  const suggestions: string[] = [];
  const args: string[] = [];
  
  const responses = lead.surveyResponses || {};
  const lastActivity = activities[0];
  const daysSinceContact = lead.lastContactAt 
    ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Status-based suggestions
  switch (lead.status) {
    case 'novo':
      suggestions.push('Fazer primeiro contato via LinkedIn ou WhatsApp');
      suggestions.push('Revisar respostas do questionário antes do contato');
      suggestions.push('Agendar ligação de apresentação');
      break;
    case 'em_contato':
      if (daysSinceContact && daysSinceContact > 3) {
        suggestions.push(`Fazer follow-up - ${daysSinceContact} dias sem contato`);
      }
      suggestions.push('Enviar material sobre a metodologia PREP-MM');
      suggestions.push('Agendar reunião para apresentação detalhada');
      break;
    case 'qualificado':
      suggestions.push('Apresentar cases de sucesso de mentorados');
      suggestions.push('Discutir objetivos específicos de transição para conselho');
      suggestions.push('Enviar proposta comercial');
      break;
    case 'negociando':
      suggestions.push('Esclarecer dúvidas sobre investimento');
      suggestions.push('Oferecer condições especiais se aplicável');
      suggestions.push('Agendar ligação para fechamento');
      break;
  }

  // Temperature-based arguments
  if (lead.temperature === 'hot') {
    args.push('Lead quente: tem perfil ideal e demonstra urgência. Priorize o atendimento!');
    args.push('Destaque: Turma 2 começa em 23/02/2026 - vagas limitadas');
  } else if (lead.temperature === 'warm') {
    args.push('Lead morno: demonstra interesse mas pode precisar de mais informações');
    args.push('Foque em entender as dúvidas e objeções específicas');
  } else {
    args.push('Lead frio: precisa de nutrição - envie conteúdos relevantes');
    args.push('Convide para lives e eventos do Marcelo e Hamilton');
  }

  // Survey-based arguments
  Object.entries(responses).forEach(([question, answer]) => {
    const q = question.toLowerCase();
    const a = String(answer).toLowerCase();
    
    if (q.includes('linkedin') && (a.includes('melhorar') || a.includes('desenvolver') || a.includes('sim'))) {
      args.push('Interesse em LinkedIn: Destaque o módulo "LinkedIn Estratégico" com prompts personalizados');
    }
    if (q.includes('conselho') && (a.includes('não sei') || a.includes('dificuldade'))) {
      args.push('Dificuldade na transição: Fale sobre a metodologia passo-a-passo e o framework 5C');
    }
    if (q.includes('mentoria') || q.includes('acompanhamento')) {
      args.push('Busca acompanhamento: Enfatize as 12 sessões ao vivo + Módulo 2 com Hamilton Felix');
    }
  });

  // Recent activity-based suggestions
  if (lastActivity) {
    const activityAge = Math.floor((Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (activityAge > 7 && lead.status !== 'convertido' && lead.status !== 'perdido') {
      suggestions.unshift(`ATENÇÃO: ${activityAge} dias desde última interação - retomar contato`);
    }
  }

  return {
    nextSteps: suggestions.slice(0, 5),
    arguments: args.slice(0, 5),
    status: lead.temperature === 'hot' ? 'priority' : lead.temperature === 'warm' ? 'follow' : 'nurture'
  };
}

export function registerEnvRoute(app: Express) {
  app.get("/api/env-vars", (req, res) => {
    const token = req.query.token as string;
    const secret = process.env.SESSION_SECRET;
    if (!secret || token !== secret) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        vars[key] = value;
      }
    }
    return res.json(vars);
  });
}
