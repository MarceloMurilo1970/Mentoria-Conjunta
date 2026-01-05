import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertRegistrationSchema, insertVendorSchema, insertLeadActivitySchema, insertLeadFollowUpSchema } from "@shared/schema";
import { sendRegistrationEmail, sendRegistrationListEmail, sendRegistrationNotificationEmail } from "./email";
import { addEventRegistration, getAllEventRegistrations, type EventRegistration, fetchSurveyResponses, calculateLeadScore } from "./googleSheets";
import path from "path";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

      try {
        await sendRegistrationEmail(
          registration.email,
          registration.name,
          registration.paymentMethod as "pix" | "installments"
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

  // Update payment received status (legacy)
  app.patch("/api/registrations/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { received } = req.body;
      
      if (typeof received !== 'boolean') {
        return res.status(400).json({ error: "Campo 'received' deve ser boolean" });
      }
      
      const updated = await storage.updatePaymentReceived(id, received);
      
      if (!updated) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      res.json({ success: true, registration: updated });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Erro ao atualizar status de pagamento" });
    }
  });

  // Update payment status with full details (PIX only)
  app.patch("/api/registrations/:id/payment-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, paidAmount, remainingPaymentDate } = req.body;
      
      // Validate payment status
      if (!['pendente', 'pago', 'parcial'].includes(paymentStatus)) {
        return res.status(400).json({ error: "Status de pagamento inválido" });
      }
      
      // Get current registration to verify it's PIX
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      if (registration.paymentMethod !== 'pix') {
        return res.status(400).json({ error: "Esta funcionalidade é apenas para pagamentos PIX" });
      }

      const PIX_TOTAL = 8000;
      let validatedPaidAmount = 0;

      // Validate partial payment fields
      if (paymentStatus === 'parcial') {
        const paidNum = Number(paidAmount);
        if (isNaN(paidNum) || paidNum <= 0 || paidNum >= PIX_TOTAL) {
          return res.status(400).json({ error: "Valor pago deve ser maior que 0 e menor que o total" });
        }
        validatedPaidAmount = paidNum;
      } else if (paymentStatus === 'pago') {
        validatedPaidAmount = PIX_TOTAL;
      }
      
      const updated = await storage.updatePaymentStatus(id, {
        paymentStatus,
        paidAmount: validatedPaidAmount,
        totalAmount: PIX_TOTAL,
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

  // Update batch (manual override)
  app.patch("/api/registrations/:id/batch", async (req, res) => {
    try {
      const { id } = req.params;
      const { batch } = req.body;
      
      if (![1, 2, 3].includes(Number(batch))) {
        return res.status(400).json({ error: "Lote deve ser 1, 2 ou 3" });
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

  // ==================== CRM ENDPOINTS ====================

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

  app.delete("/api/crm/vendors/:id", async (req, res) => {
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

      for (const response of surveyResponses) {
        // Check if lead already exists by email
        const existingLead = response.email ? await storage.getLeadByEmail(response.email) : null;
        
        // Calculate score
        const { score, temperature, reasons } = calculateLeadScore(response.responses);
        
        if (existingLead) {
          // Update existing lead with new score if higher
          if (score > existingLead.score) {
            await storage.updateLead(existingLead.id, {
              score,
              temperature,
              surveyResponses: response.responses,
              aiSummary: reasons.join(', '),
            });
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
            status: 'novo',
            aiSummary: reasons.join(', '),
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

  // Claim/Release lead
  app.post("/api/crm/leads/:id/claim", async (req, res) => {
    try {
      const { id } = req.params;
      const { vendorId } = req.body;
      const lead = await storage.claimLead(id, vendorId);
      
      // Log activity
      await storage.createLeadActivity({
        leadId: id,
        vendorId,
        type: 'status_change',
        content: 'Lead reservado para trabalho',
        scoreChange: 0,
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
      const lead = await storage.releaseLead(id);
      
      // Log activity
      await storage.createLeadActivity({
        leadId: id,
        vendorId: null,
        type: 'status_change',
        content: 'Lead liberado',
        scoreChange: 0,
      });
      
      res.json(lead);
    } catch (error) {
      console.error("Error releasing lead:", error);
      res.status(500).json({ error: "Erro ao liberar lead" });
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
      
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Erro ao criar atividade" });
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
    args.push('Destaque: Turma 2 começa em Janeiro 2026 - vagas limitadas');
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
      args.push('Busca acompanhamento: Enfatize as 8 sessões ao vivo + Módulo 2 com Hamilton Felix');
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
