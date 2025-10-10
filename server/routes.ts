import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { sendRegistrationEmail, sendRegistrationListEmail } from "./email";
import path from "path";

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

  const httpServer = createServer(app);
  return httpServer;
}
