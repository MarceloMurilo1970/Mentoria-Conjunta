# Mentorship Registration Site - Marcelo Murilo & Hamilton Felix

## Overview

This project is a platform for Marcelo Murilo and Hamilton Felix's mentorship program, designed to manage registrations for a promotional live event and a comprehensive mentorship program (Turma 2). It targets board members (active or transitioning) by highlighting the benefits of developing authority and securing board positions.

Key capabilities include:
- **Event Landing Page (`/`):** Facilitates pre-registration for a promotional live event with Google Sheets integration and WhatsApp group invites.
- **Mentorship Registration (`/mentoria`):** Serves as the main registration page for the Turma 2 mentorship program, featuring program details, testimonials, payment processing, and SendGrid confirmations.

The Turma 2 program runs from January to March 2026, focusing on authority building, opportunity creation, and securing board positions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Vite, Wouter for routing, and TanStack Query for data fetching.
- **UI Framework:** Shadcn UI (built on Radix UI) and Tailwind CSS for utility-first styling.
- **Design:** Primarily dark mode with a professional aesthetic, custom color palette (dark charcoal blue with vibrant blue accents), Inter font, and JetBrains Mono for dates/numbers.

### Backend
- **Server Framework:** Express.js with TypeScript for a REST API, including middleware for logging and error handling.
- **Data Validation:** Zod for server-side schema validation, complemented by React Hook Form with Zod resolver on the client-side.
- **Storage Strategy:** PostgreSQL database (Neon serverless) via Drizzle ORM, utilizing an interface-based storage abstraction.
- **Database Schema:** `registrations` table, and CRM-related tables (`vendors`, `leads`, `leadActivities`, `leadFollowUps`) for lead management.
- **Admin Page:** An unauthenticated `/admin` page for managing registrations and leads.

### UI/UX Decisions
- **Event Page (`/`):** Features a full-screen hero section, countdown timer, dark-themed registration form, and smooth scroll animations.
- **Mentorship Page (`/mentoria`):** Includes program details, testimonial tiles with expand/collapse functionality, video thumbnail support, and a comprehensive "Jornada Completa da Mentoria" section detailing frameworks (PREP, LinkedIn Estratégico, Autoridade por Conteúdo, Interações, Networking, 5C).
- **Testimonials:** Reusable `TestimonialTile` component for text, avatars, LinkedIn links, and optional video thumbnails.
- **Admin Panel:** Light theme for readability, supporting multiple invoices and vendor payments tracking. Includes a commission system based on pricing batches and vendor assignments, lead management with scoring, vendor assignment, activity tracking, and AI suggestions.

### Technical Implementations
- **Countdown Timer:** Real-time, timezone-aware countdown.
- **Video Testimonials:** Enhanced component support for embedded video testimonials with custom thumbnails.
- **Methodology Expansion:** Detailed content for "Due Diligence e Entrada Estratégica em Conselhos" and integration of personalized prompts.
- **Email Error Handling:** Improved UX for SendGrid failures.
- **CRM System:** Comprehensive lead management with Google Sheets sync, lead scoring with detailed breakdown (category, points, reason, question, answer), temperature classification, vendor assignment, activity tracking with admin-only deletion, follow-up scheduling, and AI-powered suggestions. Includes vendor edit/delete (admin-only), converted leads tracking with registration details, and proper TypeScript types for jsonb fields (surveyResponses, scoreBreakdown).

## External Dependencies

- **Email Service:** SendGrid for transactional emails, secured via Replit Connectors.
- **Payment Integration:** PIX payment and credit card installments via Infinite Pay.
- **Database:** PostgreSQL (Neon serverless) managed by Drizzle ORM, utilizing `@neondatabase/serverless`.
- **Authentication & Security:** 
  - Email-only authentication for CRM admin panel (no passwords required)
  - HMAC SHA-256 signed tokens with 7-day expiry for session fallback authentication
  - Admin emails: contato@marcelomurilo.com.br, marcelo@marcelomurilo.com.br, hamilton@opes.com.br
  - Vendors authenticate via registered email (must be active in database)
  - `SESSION_SECRET` environment variable required for token signing (no hardcoded fallback)
  - PostgreSQL session store (connect-pg-simple) for production session persistence
  - Trust proxy configured for HTTPS cookie handling in production
- **Development Tools:** Replit-specific Vite plugins (error overlay, development banner), Cartographer plugin.
- **Third-Party UI Libraries:** Radix UI, Lucide React, Embla Carousel, CMDK.
- **Google Sheets Integration:** Replit's native Google Sheets connector for event registrations (ID: 1-fCalJZRLnerVeTsPQhetEOjM816FxLWquS6kX47o1k) and CRM lead syncing (ID: 1iOSApmifjm54hpGx5vPYWkfBwGNMM5PO57PrD70DgHI).
  - **KNOWN ISSUE (Production):** Google Sheets sync may fail in production deployment with "invalid authentication credentials" error. This occurs because the Replit connector uses OAuth tokens that may not transfer correctly to deployed instances. Solution options:
    1. Re-authorize the Google Sheets integration after deployment
    2. Use a Google Service Account for production (requires GOOGLE_SERVICE_ACCOUNT_KEY secret)
    3. Manually sync leads via development environment