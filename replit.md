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

**`/` (Home - Event Landing Page)** - Live event pre-registration (PRIMARY PAGE)
- **This is the first page visitors see**
- Event details: Dec 4, 2025, 8 PM BRT
- Topic: "Criar Autoridade, Construir Oportunidades e Conquistar Conselhos"
- Testimonials section featuring Rodrigo Padovez and generic examples
- Registration form: Name, Phone, LinkedIn, Certification status, Board count, Interests
- Direct Google Sheets integration (no database storage)
- Success screen with WhatsApp group invite link
- CTA buttons to mentorship page (`/mentoria`)

**`/mentoria`** - Mentorship registration and payment
- Full program details with session schedules (Turma 2 - Jan-Mar 2026)
- Registration form with email, name, phone, payment method selection
- SendGrid email confirmations with payment instructions
- PostgreSQL persistence via Drizzle ORM
- Admin notification emails after each registration
- Payment options: PIX R$ 8.000 or 5x R$ 1.750 (total R$ 8.750)

**`/admin`** - Admin dashboard (unauthenticated)
- Displays all PostgreSQL mentorship registrations in table format
- Real-time data via GET /api/registrations endpoint
- Internal use only

## Recent Changes (November 24, 2025)

**Latest Updates - Sessão 7 Addition & Methodology Expansion:**
- **New Card #7 (Due Diligence e Entrada Estratégica em Conselhos):** Critical content about strategic entry into board positions
  - Covers: Perguntas reveladoras (5 key questions for partners/CEO), Documentação obrigatória, Red flags decisivos, Blindagem contratual, Calendário estratégico
  - Quote: "Entrar no conselho errado destrói reputação, energia e credibilidade"
  - Content extracted from Sessão 7 PowerPoint presentation
- **Renumbered Hamilton Felix cards from 7-9 to 8-10** to accommodate new Sessão 7 content
- **Total methodology cards expanded from 9 to 10:**
  - Cards 1-6: Módulo 1 (Marcelo Murilo) - Authority/LinkedIn frameworks
  - Card 7: Módulo 1 (Marcelo Murilo) - Due Diligence & Strategic Entry
  - Cards 8-10: Módulo 2 (Hamilton Felix) - Board implementation strategies
- Logical progression: Authority building → Strategic entry → Board implementation

**Previous Updates - Personalized Prompts Enhancement:**
- **Card #2 (LinkedIn Estratégico):** Added information about personalized prompts for generating insights and LinkedIn posts
- **Card #3 (Autoridade por Conteúdo):** Added information about personalized prompts for generating comments, responding to comments, and creating Newsletters
- **Card #4 (Interações que Constroem Autoridade):** Added information about learning to use connection automation tools strategically and ethically
- All additions maintain professional tone and enhance value proposition

**Previous Updates - Módulo 2 Integration & Event Hero Refinement:**
- **Event Page Hero:** Updated to clearly communicate dual-mentor value proposition
  - Main headline: "Marcelo Murilo e Hamilton Felix vão contar sobre"
  - Focus: "Como criar AUTORIDADE como CONSELHEIRO" (both keywords highlighted)
  - Subtitle: "E depois construir oportunidades em empresas para conquistar sua posição em conselhos estratégicos"
- **Framework PREP Enhanced (Módulo 1):**
  - Added "Módulo 1 - Marcelo Murilo" label for clarity
  - New intro: "O primeiro passo: definir seu nicho, propósito, personas e dores"
  - Added bullet: "Definição estratégica: Nicho, propósito, personas e suas dores específicas"
- **Módulo 2 Content Added (Hamilton Felix) - 3 New Methodology Cards:**
  - Card #7: A Experiência de Construir Conselhos (journey, board types, preparation, dynamics)
  - Card #8: Fomentar a Implementação de Conselhos (maturity stages, composition, governance, metrics)
  - Card #9: Implementar Conselhos e Criar Seu Espaço (mapping, approach, negotiation, portfolio)
- **Total methodology cards expanded from 6 to 9:**
  - Cards 1-6: Módulo 1 (Marcelo Murilo) - Authority/LinkedIn frameworks
  - Cards 7-9: Módulo 2 (Hamilton Felix) - Board implementation strategies

**Previous Updates - Sales Copy Enhancement:**
- Updated Rodrigo Padovez highlight phrase to emphasize core value proposition
- Pre-filled LinkedIn field with "https://linkedin.com/in/" for better UX
- Added personalization details: participants receive completely personalized reports and prompts
- Created comprehensive "A Jornada Completa da Mentoria" section with frameworks:
  1. Framework PREP (Propósito, Reputação, Experiência, Presença)
  2. LinkedIn Estratégico (Headline, Sobre, CAI format)
  3. Autoridade por Conteúdo (Post architecture, Golden Hour)
  4. Interações que Constroem Autoridade (Strategic comments)
  5. Networking com Propósito (Curation and automation)
  6. Framework 5C (Competência, Caráter, Contexto, Contribuição, Credibilidade)
- Added "O Que CEOs Compram" section highlighting value propositions
- All content extracted from actual session presentations

## Previous Changes

**Event Landing Page Redesign (Final):**
- Completely redesigned `/` (event page) with modern dark theme using promo image (IMG_7577) as hero
- Full-screen hero section with gradient overlays for readability
- Highlighted keywords (AUTORIDADE, OPORTUNIDADES, CONSELHOS) in yellow/gold
- Modern date/time display: "04.12.2025" and "Início às 20:00hs"
- Dark-themed registration form with proper contrast
- Removed testimonials from event page (moved to mentoria page)
- Smooth scroll animation to registration form
- Google Sheets integration maintained for event registrations

**Testimonials System Redesign:**
- Created reusable TestimonialTile component with modern design
- Moved testimonials from event page to mentoria page (/mentoria)
- Features:
  - Italic text styling for testimonial content
  - Avatar with photo or initials fallback
  - Expand/collapse functionality for long testimonials (>300 chars)
  - Highlight phrase feature for key quotes
  - LinkedIn link integration
  - Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
- Integrated Rodrigo Padovez photo (IMG_7578) in his testimonial tile
- Three testimonials: Rodrigo Padovez (long, with photo), Maria Silva, Carlos Eduardo

**Route Structure Finalized:**
- `/` → Event landing page (primary entry point for promotional live)
- `/mentoria` → Mentorship registration with testimonials, program details, payment
  - Back button to return to event page
  - Auto-scroll to top on page load
  - Section order: Hero → About (Para Quem) → Testimonials → Program → Registration
- `/admin` → Admin dashboard for viewing registrations

**Mentoria Page Enhancements:**
- Back button with proper accessibility (uses asChild pattern)
- "Para Quem é Esta Mentoria" section explains target audience and benefits
- Corrected Rodrigo Padovez LinkedIn URL: https://www.linkedin.com/in/rodrigopadovez/
- Page scrolls to top when navigating from event page
- Reorganized content flow for better user experience

**Email Error Handling Enhancement:**
- Improved UX when SendGrid fails (502 errors)
- Payment instructions now display even when email sending fails
- Users see complete payment details in error state (PIX or installments)