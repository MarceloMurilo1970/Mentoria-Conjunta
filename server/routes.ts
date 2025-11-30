import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { sendRegistrationEmail, sendRegistrationListEmail } from "./email";
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

      // Send registration list to admin
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

  // Update payment received status
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

  const httpServer = createServer(app);
  return httpServer;
}
