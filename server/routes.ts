import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { sendRegistrationEmail, sendRegistrationListEmail, sendRegistrationNotificationEmail } from "./email";
import { addEventRegistration, getAllEventRegistrations, type EventRegistration } from "./googleSheets";
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
      const { invoiceIssued, invoiceIssuedAt } = req.body;
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Inscrição não encontrada" });
      }
      
      const updated = await storage.updateInvoice(id, {
        invoiceIssued: Boolean(invoiceIssued),
        invoiceIssuedAt: invoiceIssued && invoiceIssuedAt ? new Date(invoiceIssuedAt) : null,
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

  const httpServer = createServer(app);
  return httpServer;
}
