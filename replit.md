# Mentorship Registration Site - Marcelo Murilo & Hamilton Felix

## Overview

This is a dual-purpose platform for Marcelo Murilo and Hamilton Felix's mentorship program:

1. **Event Landing Page (`/evento`):** Pre-registration for promotional live event (Dec 4, 2025, 8 PM BRT) with Google Sheets integration and WhatsApp group invite
2. **Mentorship Registration (`/`):** Main registration page for Turma 2 mentorship program with payment processing and SendGrid confirmations

**Program Schedule (Turma 2):**
- Module 1 (Marcelo Murilo - 8H): January 19 to March 16, 2026
- Module 2 (Hamilton Felix - 4H): March 9 and 16, 2026
- All sessions: 7:00 PM - 8:00 PM or 8:00 PM - 9:00 PM BRT

**Event Details (Live):**
- Date: December 4, 2025, 8:00 PM BRT
- Topic: "Criar Autoridade, Construir Oportunidades e Conquistar Conselhos"
- Target audience: Board members (active or transitioning)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component-based architecture
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Framework:**
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Dark mode as the primary design approach with professional aesthetics
- Custom color palette emphasizing trust and authority (dark charcoal blue backgrounds with vibrant blue accents)

**Design System:**
- Inter font family for headings and body text
- JetBrains Mono for dates and module numbers
- Consistent spacing using Tailwind's spacing scale (4, 6, 8, 12, 16, 20, 24)
- Sophisticated dark mode color scheme with HSL-based CSS variables for theme flexibility

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the REST API
- Middleware-based request logging and error handling
- Single-page application (SPA) serving with Vite integration in development

**Data Validation:**
- Zod schema validation for type-safe data validation
- Drizzle-Zod integration for automatic schema generation from database models
- React Hook Form with Zod resolver for client-side form validation

**Storage Strategy:**
- PostgreSQL database for persistent storage (Neon serverless)
- Interface-based storage abstraction (IStorage) for flexibility
- DbStorage implementation using Drizzle ORM
- Schema-first approach with database migrations via drizzle-kit
- All registrations persist across server restarts
- Admin page available at `/admin` to view all registrations (currently unauthenticated)

**Database Schema:**
- Table: `registrations`
- Columns: id (varchar UUID, auto-generated), name, email, phone, payment_method, created_at (timestamp)
- Primary key: id with gen_random_uuid()
- Automatic timestamp tracking with defaultNow()

**Key Design Decisions:**
- The application uses an abstraction layer for storage, making it database-agnostic
- Current implementation uses PostgreSQL via Drizzle ORM for durable persistence
- All database schemas are defined in shared/schema.ts for type safety across client and server
- Admin page provides real-time view of all registrations with GET /api/registrations endpoint

### External Dependencies

**Email Service:**
- SendGrid integration for transactional emails
- Replit Connectors API for secure credential management
- Automated registration confirmation emails with payment instructions
- Dynamic email content based on payment method (PIX vs installments)
- Admin notification system: sends complete registration list to 3 admin emails (contato@marcelomurilo.com.br, faturamento@marcelomurilo.com.br, hamiltonfelix@gmail.com) after each new registration
- Hero image served from `/email-assets/hero-image.png` for email headers
- Click tracking disabled to avoid SSL certificate issues

**Payment Integration:**
- PIX payment: R$ 8.000,00 via CNPJ 17.840.516/0001-47 (Opes Informática Ltda)
- Credit card installments: 5x R$ 1.750,00 (total R$ 8.750,00) via Infinite Pay
- Infinite Pay payment link: https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-50rYBDe3R-8750,00
- Turma 2 - Starting January 2026 (normal price R$ 9.400)
- Payment instructions included in confirmation emails and success screen

**Database:**
- Drizzle ORM configured for PostgreSQL
- Neon serverless PostgreSQL driver (@neondatabase/serverless)
- WebSocket-based connection pooling for serverless environments
- Migration system via drizzle-kit

**Authentication & Security:**
- Replit identity tokens for API authentication (REPL_IDENTITY, WEB_REPL_RENEWAL)
- Environment-based credential management
- Secure SendGrid API key handling through Replit Connectors

**Development Tools:**
- Replit-specific Vite plugins for error overlay and development banner
- Runtime error modal for improved debugging experience
- Cartographer plugin for code navigation in Replit environment

**Third-Party UI Libraries:**
- Radix UI for accessible, unstyled component primitives
- Lucide React for consistent iconography
- Embla Carousel (via dependencies) for potential carousel functionality
- CMDK for command palette interface

**Google Sheets Integration:**
- Replit's native Google Sheets connector for secure OAuth credential management
- Event registrations saved directly to Google Sheets spreadsheet
- Spreadsheet ID: 1-fCalJZRLnerVeTsPQhetEOiM816FxLWquS6kX47o1k
- Automatic timestamp in Brazilian timezone format
- Columns: Timestamp, Name, Phone, LinkedIn, Has Certification, Board Count, Interests
- Access token refresh handled automatically by Replit connector

## Application Routes

**`/` (Home)** - Mentorship registration page
- Full program details with session schedules
- Registration form with email, name, phone, payment method selection
- SendGrid email confirmations with payment instructions
- PostgreSQL persistence via Drizzle ORM
- Admin notification emails after each registration

**`/evento` (Event Page)** - Live event pre-registration
- Event details: Dec 4, 2025, 8 PM BRT
- Testimonials section featuring Rodrigo Padovez and generic examples
- Registration form: Name, Phone, LinkedIn, Certification status, Board count, Interests
- Direct Google Sheets integration (no database storage)
- Success screen with WhatsApp group invite link
- CTA button to mentorship page

**`/admin` (Admin Dashboard)** - View all mentorship registrations
- Displays all PostgreSQL registrations in table format
- Currently unauthenticated (internal use only)
- Real-time data via GET /api/registrations endpoint

## Recent Changes (November 24, 2025)

**Event Landing Page Implementation:**
- Created `/evento` route with complete event registration flow
- Integrated Google Sheets API for direct data persistence
- Implemented testimonials section with real testimonial from Rodrigo Padovez
- Added success screen with WhatsApp group invite automation
- Fixed date display (2025 instead of 2024)
- Backend endpoint: POST /api/event-registrations with Zod validation

**Email Error Handling Enhancement:**
- Improved UX when SendGrid fails (502 errors)
- Payment instructions now display even when email sending fails
- Users see complete payment details in error state (PIX or installments)